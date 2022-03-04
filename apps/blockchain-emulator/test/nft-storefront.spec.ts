import { jest, beforeEach, beforeAll, afterAll, it, describe } from '@jest/globals'
import {
  IFlowAccount,
  toUFix64,
  getEventId,
  deployFusd,
  getFusdBalance,
} from '@samatech/onflow-ts'
import {
  AccountManager,
  getCollectionIDs,
  getCollectionNFTs,
  deployNftStorefront,
  createNftListing,
  getListing,
  getListings,
  getListingCount,
  removeNftListing,
  getStorefrontId,
  purchaseNftListing,
} from '@ismedia/backend/feature-flow'
import { stopEmulator, testSetup } from '@ismedia/backend/feature-blockchain-emulator'
import {
  prepareAdminAccount,
  prepareUserAccount,
  preparePurchaseNfts,
  prepareListingFirstNftInCollection,
} from './helpers/nft-storefront-helpers'
import { shallPass } from './helpers/jest-helpers'
import { saleOfferG } from './helpers/test-fixtures'

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(15000)

const accounts = new AccountManager()

const NFT_STOREFRONT_ADDRESS = 'f8d6e0586b0a20c7'

//
let Admin: IFlowAccount
let Eve: IFlowAccount
let Frank: IFlowAccount

interface PurchaseEventProps {
  buyer: IFlowAccount
  seller: IFlowAccount
  storefrontId: number
  nftId: number
  listingId: number
  priceUFix64: string
}

// Helper for determining the expected events from a purchase_listing tx
const expectedPurchaseListingEvents = (purchaseEventProps: PurchaseEventProps) => {
  const { buyer, seller, storefrontId, nftId, listingId, priceUFix64 } =
    purchaseEventProps
  return [
    {
      type: 'FUSD.TokensWithdrawn',
      data: { amount: priceUFix64, from: buyer.address },
    },
    {
      type: 'FrontRow.Withdraw',
      data: { id: nftId, from: seller.address },
    },
    {
      type: 'FUSD.TokensWithdrawn',
      data: { amount: priceUFix64, from: buyer.address },
    },
    {
      type: 'FUSD.TokensDeposited',
      data: { amount: priceUFix64, to: seller.address },
    },
    {
      type: 'FUSD.TokensDeposited',
    },
    {
      type: 'NFTStorefront.ListingCompleted',
      data: {
        listingResourceID: listingId,
        storefrontResourceID: storefrontId,
        purchased: true,
        nftType: getEventId(NFT_STOREFRONT_ADDRESS, 'FrontRow', 'NFT', 'A'),
        nftID: nftId,
      },
    },
    {
      type: 'FrontRow.Deposit',
      data: { id: nftId, to: buyer.address },
    },
  ]
}

describe('NFTStorefront Contract', () => {
  beforeAll(async () => {
    await testSetup(7005)
    Admin = accounts.register('accounts/emulator-account')
    Eve = await accounts.create(Admin, 'accounts/emulator-account-eve')
    Frank = await accounts.create(Admin, 'accounts/emulator-account-frank')
  })
  beforeEach(() => {
    console.log(expect.getState().currentTestName)
  })

  // Stop emulator, so it could be restarted
  afterAll(async () => {
    await stopEmulator()
  })

  it('deploys NFTStorefront contract', async () => {
    await deployFusd(Admin)
    expect(await shallPass(deployNftStorefront(Admin))).toEmit(
      'NFTStorefront.NFTStorefrontInitialized',
    )
  })

  describe('User listing management', () => {
    it('creates a listing without having a storefront', async () => {
      // Prepare accounts
      await prepareAdminAccount({ admin: Admin })
      await prepareUserAccount({ user: Eve, admin: Admin, fusdAmount: 100 })

      // Prepare Eve's account (purchase NFTs)
      const purchaseQuantity = 2
      await preparePurchaseNfts({
        user: Eve,
        admin: Admin,
        saleOffer: saleOfferG,
        quantity: purchaseQuantity,
      })

      // Prep information for the listing
      const collectionIDs = await getCollectionIDs(Eve)
      const nftId = collectionIDs[0]
      const price = 2.5

      // Create a listing
      const createListingTxResult = await shallPass(createNftListing(Eve, nftId, price))

      // Get information about listings and the storefront resource that was generated
      // automatically
      const listings = await getListings(Eve)
      const storefrontId = await getStorefrontId(Eve)

      // Check if the public NFT storefront was automatically created
      expect(createListingTxResult.events[0]).toMatchObject({
        type: getEventId(Admin.address, 'NFTStorefront', 'StorefrontInitialized', 'A'),
        data: {
          storefrontResourceID: storefrontId,
        },
      })

      // Check if the correct NFT was listed for sale
      expect(createListingTxResult.events[1]).toMatchObject({
        type: getEventId(Admin.address, 'NFTStorefront', 'ListingAvailable', 'A'),
        data: {
          storefrontAddress: Eve.address,
          listingResourceID: listings[0],
          nftType: getEventId(Admin.address, 'FrontRow', 'NFT', 'A'),
          nftID: nftId,
          ftVaultType: getEventId(Admin.address, 'FUSD', 'Vault', 'A'),
          price: toUFix64(price),
        },
      })
      expect(listings.length).toBe(1)
    })

    it('creates a listing with an existing storefront', async () => {
      // Prep information for the listing
      const collectionIDs = await getCollectionIDs(Eve)
      const nftId = collectionIDs[1]
      const price = 3.5

      // Check that the storefront already exists
      const storefrontId = await getStorefrontId(Eve)
      expect(typeof storefrontId).toBe('number')

      // Create a listing
      const createListingTxResult = await shallPass(createNftListing(Eve, nftId, price))

      // Get information about listings and an existing storefront resource
      const listings = await getListings(Eve)

      // Check if the correct NFT was listed for sale
      expect(createListingTxResult.events[0]).toMatchObject({
        type: getEventId(Admin.address, 'NFTStorefront', 'ListingAvailable', 'A'),
        data: {
          storefrontAddress: Eve.address,
          listingResourceID: listings[0],
          nftType: getEventId(Admin.address, 'FrontRow', 'NFT', 'A'),
          nftID: nftId,
          ftVaultType: getEventId(Admin.address, 'FUSD', 'Vault', 'A'),
          price: toUFix64(price),
        },
      })
      expect(listings.length).toBe(2)
    })

    it('removes a listing', async () => {
      const beforeListedNfts = await getListings(Eve)
      const listingId = beforeListedNfts[0]
      const storefrontId = await getStorefrontId(Eve)

      const removeListingTxResult = await shallPass(removeNftListing(Eve, listingId))
      const afterListedNfts = await getListings(Eve)

      // Verify emitted event and its data
      expect(removeListingTxResult).toEmit([
        {
          type: 'NFTStorefront.ListingCompleted',
          data: {
            listingResourceID: listingId,
            storefrontResourceID: storefrontId,
            purchased: false,
            nftType: getEventId(NFT_STOREFRONT_ADDRESS, 'FrontRow', 'NFT', 'A'),
            nftID: 1,
          },
        },
      ])
      expect(afterListedNfts.length).toBe(beforeListedNfts.length - 1)
    })

    it('lists NFT for zero price', async () => {
      const price = 0

      // Try creating a free listing
      await expect(
        prepareListingFirstNftInCollection({ user: Eve, price }),
      ).rejects.toMatch('Listing must have non-zero price')
    })
  })

  describe('NFT purchase from user to user', () => {
    it('purchases a listing without having a collection', async () => {
      // Prepare Frank's account
      await prepareUserAccount({ user: Frank, admin: Admin, fusdAmount: 50 })

      // Make sure Frank does not have a collection yet
      await expect(getCollectionIDs(Frank)).rejects.toThrowError(
        'Could not borrow capability from public collection',
      )

      // Get the listing information
      const listings = await getListings(Eve)
      const listingId = listings[0]
      const listing = await getListing(Eve, listingId)

      // Keep track Eve's information before the purchase to compare after
      const eveCollectionBefore = await getCollectionIDs(Eve)
      const eveListingsCountBefore = await getListingCount(Eve)
      const eveBalanceBefore = await getFusdBalance(Eve)
      const frankBalanceBefore = await getFusdBalance(Frank)

      // Execute the purchase
      const buyer: IFlowAccount = Frank
      const seller: IFlowAccount = Eve
      const purchaseListingTxResult = await shallPass(
        purchaseNftListing(buyer, listingId, seller),
      )

      // Check transaction details in the emitted event
      expect(purchaseListingTxResult).toEmit(
        expectedPurchaseListingEvents({
          buyer,
          seller,
          storefrontId: listing.storefrontID,
          nftId: parseFloat(listing.nftID),
          listingId,
          priceUFix64: listing.salePrice,
        }),
      )

      // Make sure Eve has on less NFT listed for sale
      const eveAfterListingsCount = await getListingCount(Eve)
      expect(eveAfterListingsCount).toBe(eveListingsCountBefore - 1)

      // Prep balances for comparison
      const eveBalanceAfter = await getFusdBalance(Eve)
      const frankBalanceAfter = await getFusdBalance(Frank)
      const expectedEveBalance =
        parseFloat(eveBalanceBefore) + parseFloat(listing.salePrice)
      const expectedFrankBalance =
        parseFloat(frankBalanceBefore) - parseFloat(listing.salePrice)

      // Make sure the purchase has been reflected correctly in balances of both parties
      expect(eveBalanceAfter).toBe(toUFix64(expectedEveBalance))
      expect(frankBalanceAfter).toBe(toUFix64(expectedFrankBalance))

      // Check Eve's collection
      const eveCollectionAfter = await getCollectionNFTs(Eve)
      expect(eveCollectionAfter.length).toBe(eveCollectionBefore.length - 1)

      // Check Frank's collection
      const frankCollection = await getCollectionNFTs(Frank)
      expect(frankCollection.length).toBe(1)
    })

    it('purchases a listing with an existing collection', async () => {
      // Create a listing
      const price = 5.5
      const listingId = await prepareListingFirstNftInCollection({ user: Frank, price })
      const listing = await getListing(Frank, listingId)

      // Keep track Eve's information before the purchase to compare after
      const eveCollectionBefore = await getCollectionIDs(Eve)
      const frankListingsCountBefore = await getListingCount(Frank)
      const eveBalanceBefore = await getFusdBalance(Eve)
      const frankBalanceBefore = await getFusdBalance(Frank)

      // Execute the purchase
      const buyer: IFlowAccount = Eve
      const seller: IFlowAccount = Frank
      const purchaseListingTxResult = await shallPass(
        purchaseNftListing(buyer, listingId, seller),
      )

      // Check transaction details in the emitted event
      expect(purchaseListingTxResult).toEmit(
        expectedPurchaseListingEvents({
          buyer,
          seller,
          storefrontId: listing.storefrontID,
          nftId: parseFloat(listing.nftID),
          listingId,
          priceUFix64: listing.salePrice,
        }),
      )

      // Make sure Eve has on less NFT listed for sale
      const frankAfterListingsCount = await getListingCount(Frank)
      expect(frankAfterListingsCount).toBe(frankListingsCountBefore - 1)

      // Prep balances for comparison
      const eveBalanceAfter = await getFusdBalance(Eve)
      const frankBalanceAfter = await getFusdBalance(Frank)
      const expectedEveBalance =
        parseFloat(eveBalanceBefore) - parseFloat(listing.salePrice)
      const expectedFrankBalance =
        parseFloat(frankBalanceBefore) + parseFloat(listing.salePrice)

      // Make sure the purchase has been reflected correctly in balances of both parties
      expect(eveBalanceAfter).toBe(toUFix64(expectedEveBalance))
      expect(frankBalanceAfter).toBe(toUFix64(expectedFrankBalance))

      // Check Eve's collection
      const eveCollectionAfter = await getCollectionNFTs(Eve)
      expect(eveCollectionAfter.length).toBe(eveCollectionBefore.length + 1)

      // Check Frank's collection
      const frankCollection = await getCollectionNFTs(Frank)
      expect(frankCollection.length).toBe(0)
    })

    it('does not purchase NFT with insufficient funds', async () => {
      // Create a listing
      const price = 75
      const listingId = await prepareListingFirstNftInCollection({ user: Eve, price })

      // Execute the purchase
      const buyer: IFlowAccount = Frank
      const seller: IFlowAccount = Eve

      // Try purchasing NFT without enough funds to cover the price
      await expect(purchaseNftListing(buyer, listingId, seller)).rejects.toMatch(
        'Amount withdrawn must be less than or equal than the balance of the Vault',
      )
    })

    it('does not purchase NFT from a removed listing', async () => {
      // Get the listing information
      const listings = await getListings(Eve)
      const listingId = listings[0]
      const listingCountBefore = await getListingCount(Eve)

      // Remove the listing
      await removeNftListing(Eve, listingId)

      // Make sure it is removed
      const listingCountAfter = await getListingCount(Eve)
      expect(listingCountAfter).toBe(listingCountBefore - 1)

      // Execute the purchase
      const buyer: IFlowAccount = Frank
      const seller: IFlowAccount = Eve

      // Try purchasing NFT without enough funds to cover the price
      await expect(purchaseNftListing(buyer, listingId, seller)).rejects.toMatch(
        'No Listing with that ID in Storefront',
      )
    })
  })
})
