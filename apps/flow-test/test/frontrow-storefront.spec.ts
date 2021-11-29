import { jest, beforeEach, beforeAll, afterAll, it, describe } from '@jest/globals'
import { FlowAccount, toUFix64 } from '@ismedia/shared/util-flow'
import { AccountManager } from '../src/lib/accounts'
import { stopEmulator, testSetup } from '../src/lib/common'
import { shallPass } from '../src/lib/jest-helpers'
import { TEST_CONFIG } from '../src/utils/config'
import { stealNftFromCollection, stealNftFromStorefront } from '../src/utils/security'

import {
  getTotalSupply,
  batchMintNFT,
  setupFrontRowCollectionOnAccount,
  printBlueprint,
  getCollectionIDs,
  getFrontRowNFTByBlueprint,
  blueprintA,
  blueprintB,
  blueprintC,
  blueprintD,
  getBlueprintsCount,
  getMintCountPerBlueprint,
} from '../src/utils/frontrow'

import {
  deployFrontRowStorefront,
  createSaleOffer,
  removeSaleOffer,
  buyNFT,
  getSaleOfferDetails,
  getSaleOffersCount,
  getSaleOffers,
  saleOfferA,
  saleOfferB,
  saleOfferC,
} from '../src/utils/frontrowStorefront'

import { setupFusdOnAccount, mintFusdToAccount, getBalance } from '../src/utils/fusd'

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(15000)

const accounts = new AccountManager()

//
let Admin: FlowAccount
let Eve: FlowAccount
let Frank: FlowAccount

// Set up blueprints that will be used in this test.
// The "preMintQuantity" property is a helper which enables pre-minting of NFTs
// before the tests are executed.
const blueprints = [
  { ...blueprintA, preMintQuantity: blueprintA.maxQuantity },
  { ...blueprintB, preMintQuantity: blueprintB.maxQuantity },
  { ...blueprintC, preMintQuantity: 0 },
  { ...blueprintD, preMintQuantity: 0 },
]
const saleOffers = [saleOfferA, saleOfferB, saleOfferC]
let buyers: { account: FlowAccount; amount: number }[] = []

describe('FrontRowStorefront Contract', () => {
  beforeAll(async () => {
    await testSetup({
      port: 7004,
      basePath: TEST_CONFIG.BASE_PATH,
      cdcDirectories: TEST_CONFIG.CDC_DIRECTORIES,
    })
    Admin = accounts.register('accounts/emulator-account')
    Eve = await accounts.create(Admin, 'accounts/emulator-account-eve')
    Frank = await accounts.create(Admin, 'accounts/emulator-account-frank')
    buyers = [
      { account: Eve, amount: 100 },
      { account: Frank, amount: 100 },
    ]
  })
  beforeEach(async () => {
    console.log(expect.getState().currentTestName)
  })

  // Stop emulator, so it could be restarted
  afterAll(async () => {
    await stopEmulator()
  })

  //
  it('shall deploy FrontRowStorefront contract', async () => {
    expect(await shallPass(deployFrontRowStorefront(Admin))).toEmit(
      'FrontRowStorefront.ContractInitialized',
    )
  })

  //
  it('shall be able to set up FrontRow Collection on the account', async () => {
    expect(await shallPass(setupFrontRowCollectionOnAccount(Admin)))
  })

  //
  it('shall not have any sale offers listed for sale', async () => {
    //
    const totalSaleOffers = await getSaleOffersCount(Admin)
    expect(totalSaleOffers).toBe(0)
  })

  //
  it('shall be able to set up buyer accounts', async () => {
    // Setup buyer accounts
    for (const buyer of buyers) {
      await setupFusdOnAccount(buyer.account)
      await mintFusdToAccount(Admin, buyer.account, buyer.amount)
      await setupFrontRowCollectionOnAccount(buyer.account)

      // Add FUSD to account balance
      const balance = await getBalance(buyer.account)
      expect(balance).toBe(toUFix64(buyer.amount))
    }
  })

  //
  it('shall be able to set up blueprints and mint NFTs', async () => {
    const signers = [Admin]
    const recipient = Admin

    let totalSupply = 0

    // Create blueprints and mint NFTs
    for (const blueprint of blueprints) {
      await shallPass(printBlueprint(blueprint.maxQuantity, blueprint.metadata, signers))

      // Mint NFTs
      if (blueprint.preMintQuantity != 0) {
        expect(
          await shallPass(
            batchMintNFT(blueprint.id, blueprint.preMintQuantity, recipient, signers),
          ),
        )
        totalSupply += blueprint.preMintQuantity
      }
    }

    // Check if total blueprints count is correct
    const blueprintsCount = await getBlueprintsCount()
    expect(blueprintsCount).toBe(blueprints.length)

    // Check if total number of minted NFTs is correct
    const totalNftCount = await getTotalSupply()
    expect(totalNftCount).toBe(totalSupply)
  })

  //
  describe('Admin sale offers management', () => {
    //
    it('shall be able to create sale offers', async () => {
      // Create sale offers
      for (const saleOffer of saleOffers) {
        const price = toUFix64(saleOffer.price)

        const transactionResult = await shallPass(
          createSaleOffer(Admin, saleOffer.blueprintId, price),
        )

        const saleOfferData = transactionResult.events[0].data

        // Check if correct event has been emitted
        expect(transactionResult).toEmit([
          {
            type: 'FrontRowStorefront.SaleOfferAvailable',
          },
        ])

        // Check emitted event data
        expect(saleOfferData).toMatchObject({
          storefrontAddress: Admin.address,
          blueprintId: saleOffer.blueprintId,
          price,
        })
      }
    })

    //
    it('shall have the correct number of sale offers listed for sale', async () => {
      //
      const totalSaleOffers = await getSaleOffersCount(Admin)
      expect(totalSaleOffers).toBe(saleOffers.length)
    })

    //
    it('shall have the correct sale offer listed for sale', async () => {
      //
      const saleOffers = await getSaleOffers(Admin)

      // Get sale offer details
      const saleOfferAId = saleOffers[0]
      const saleOfferA = await getSaleOfferDetails(Admin, saleOfferAId)

      // Check if sale offer details are correct
      expect(saleOfferAId).toEqual(saleOfferA.blueprintId)
      expect(saleOfferA).toEqual({
        blueprintId: saleOfferA.blueprintId,
        owner: Admin.address,
        price: saleOfferA.price,
      })
    })

    //
    it('shall not be able to create a duplicate sale offer', async () => {
      const price = toUFix64(saleOfferA.price)

      // Try creating a duplicate sale offer for a blueprint which is already on sale
      await expect(createSaleOffer(Admin, saleOfferA.blueprintId, price)).rejects.toMatch(
        'Sale offer already exists.',
      )
      expect.assertions(1)
    })
  })

  //
  describe('Non-admin user purchasing one NFT via a sale offer', () => {
    // Keep track of nftId for different tests
    let nftId: number

    //
    it('shall be able to purchase one pre-minted NFT via a sale offer', async () => {
      // Check the Admin and Eve balances before the purchase
      const beforeAdminBalance = await getBalance(Admin)
      const beforeEveBalance = await getBalance(Eve)

      // Get NFT that will be sold first
      const nftForSale = await getFrontRowNFTByBlueprint(Admin, saleOfferA.blueprintId, 1)
      nftId = nftForSale.id

      const buyNftTxResult = await shallPass(buyNFT(Eve, saleOfferA.blueprintId))
      const listedPriceUFix64 = toUFix64(saleOfferA.price)

      // Check transaction details in the emitted event
      expect(buyNftTxResult).toEmit([
        {
          type: 'FUSD.TokensWithdrawn',
          data: { amount: listedPriceUFix64, from: Eve.address },
        },
        {
          type: 'FrontRow.Withdraw',
          data: { id: nftId, from: Admin.address },
        },
        {
          type: 'FUSD.TokensDeposited',
          data: { amount: listedPriceUFix64, to: Admin.address },
        },
        {
          type: 'FUSD.TokensDeposited',
          data: { amount: listedPriceUFix64, to: Admin.address },
        },
        {
          type: 'FrontRowStorefront.Purchase',
          data: { blueprintId: saleOfferA.blueprintId, sold: 1, soldOut: true },
        },
        {
          type: 'FrontRow.Deposit',
          data: { id: nftId, to: Eve.address },
        },
      ])

      // Check the balances after the purchase
      const afterAdminBalance = await getBalance(Admin)
      const afterEveBalance = await getBalance(Eve)

      const expectedAdminBalance = parseFloat(beforeAdminBalance) + saleOfferA.price
      const expectedEveBalance = parseFloat(beforeEveBalance) - saleOfferA.price

      // Make sure the purchase has been reflected correctly in balances of both parties
      expect(afterAdminBalance).toBe(toUFix64(expectedAdminBalance))
      expect(afterEveBalance).toBe(toUFix64(expectedEveBalance))
    })

    //
    it("shall move purchased NFT into buyer's collection", async () => {
      const purchaserCollectionIDs = await getCollectionIDs(Eve)

      // Check if correct NFT has been purchased
      expect(purchaserCollectionIDs.length).toBe(1)
      expect(purchaserCollectionIDs[0]).toBe(nftId)
    })

    //
    it("shall remove the purchased NFT from the seller's collection", async () => {
      const sellerCollectionIDs = await getCollectionIDs(Admin)

      // Make sure Admin no longer has this NFT in its collection
      expect(sellerCollectionIDs.includes(nftId)).toBe(false)
    })

    //
    it('shall not be able to purchase NFTs when they are sold out', async () => {
      //
      await expect(buyNFT(Eve, saleOfferA.blueprintId)).rejects.toMatch(
        'NFTs are sold out.',
      )
      expect.assertions(1)
    })

    //
    it('shall not be able to purchase NFTs for a blueprint which is not on sale', async () => {
      //
      await expect(buyNFT(Eve, blueprintD.id)).rejects.toMatch(
        'No Sale Offer with that ID in Storefront.',
      )
      expect.assertions(1)
    })

    //
    it('shall be able to purchase one on demand minted NFT via a sale offer', async () => {
      // Check the Admin and Eve balances before the purchase
      const beforeAdminBalance = await getBalance(Admin)
      const beforeEveBalance = await getBalance(Eve)

      // Get ID of the NFT that should be sold next
      const sellerCollectionIDsBefore = await getCollectionIDs(Admin)
      const nextNftId =
        sellerCollectionIDsBefore[sellerCollectionIDsBefore.length - 1] + 1

      // There shouldn't be any pre-minted NFTs for this blueprint
      const mintCount = await getMintCountPerBlueprint(saleOfferC.blueprintId)
      expect(mintCount).toBe(0)

      // Since there are no pre-minted NFTs, the purchased NFT should be minted on the fly
      const buyNftTxResult = await shallPass(buyNFT(Eve, saleOfferC.blueprintId))
      const listedPriceUFix64 = toUFix64(saleOfferC.price)

      // Check transaction details in the emitted event
      // Make sure the "FrontRow.Withdraw" event didn't fire since we've minted on demand
      expect(buyNftTxResult).toEmit([
        {
          type: 'FUSD.TokensWithdrawn',
          data: { amount: listedPriceUFix64, from: Eve.address },
        },
        {
          type: 'FUSD.TokensDeposited',
          data: { amount: listedPriceUFix64, to: Admin.address },
        },
        {
          type: 'FUSD.TokensDeposited',
          data: { amount: listedPriceUFix64, to: Admin.address },
        },
        {
          type: 'FrontRowStorefront.Purchase',
          data: { blueprintId: saleOfferC.blueprintId, sold: 1, soldOut: false },
        },
        {
          type: 'FrontRow.Deposit',
          data: { id: nextNftId, to: Eve.address },
        },
      ])

      // Check the balances after the purchase
      const afterAdminBalance = await getBalance(Admin)
      const afterEveBalance = await getBalance(Eve)

      // Prep balances for comparison
      const expectedAdminBalance = parseFloat(beforeAdminBalance) + saleOfferC.price
      const expectedEveBalance = parseFloat(beforeEveBalance) - saleOfferC.price

      // Make sure the purchase has been reflected correctly in balances of both parties
      expect(afterAdminBalance).toBe(toUFix64(expectedAdminBalance))
      expect(afterEveBalance).toBe(toUFix64(expectedEveBalance))

      // Make sure seller's collection didn't change since NFT was minted on demand
      // and deposited into buyer's collection on the fly
      const sellerCollectionIDsAfter = await getCollectionIDs(Admin)
      expect(sellerCollectionIDsBefore).toEqual(sellerCollectionIDsAfter)

      // The mint count should be 1
      const mintCountAfter = await getMintCountPerBlueprint(saleOfferC.blueprintId)
      expect(mintCountAfter).toBe(1)
    })
  })

  //
  describe('Non-admin user purchasing all available NFTs via a sale offer', () => {
    //
    it('shall be able to purchase `maxQuantity` NFTs of Blueprint B', async () => {
      const beforeAdminBalance = parseFloat(await getBalance(Admin))
      const beforeEveBalance = parseFloat(await getBalance(Eve))

      const { maxQuantity } = blueprintB

      // Buy all NFTs from Blueprint B
      for (let i = 0; i < maxQuantity; i += 1) {
        await shallPass(buyNFT(Eve, saleOfferB.blueprintId))
      }

      const expectedAdminBalance = beforeAdminBalance + saleOfferB.price * maxQuantity
      const expectedEveBalance = beforeEveBalance - saleOfferB.price * maxQuantity

      const afterAdminBalance = await getBalance(Admin)
      const afterEveBalance = await getBalance(Eve)

      // Make sure the purchase has been reflected correctly in balances of both parties
      expect(afterAdminBalance).toBe(toUFix64(expectedAdminBalance))
      expect(afterEveBalance).toBe(toUFix64(expectedEveBalance))
    })

    it('shall not be able to purchase more than `maxQuantity` NFTs', async () => {
      //
      await expect(buyNFT(Eve, saleOfferB.blueprintId)).rejects.toMatch(
        'NFTs are sold out.',
      )
      expect.assertions(1)
    })
  })

  //
  describe('Non-admin user access', () => {
    //
    it('shall not be able to create a sale offer', async () => {
      // Try creating a sale offer
      await expect(
        createSaleOffer(Eve, saleOfferB.blueprintId, toUFix64(saleOfferB.price)),
      ).rejects.toMatch('Missing or mis-typed Storefront.')
      expect.assertions(1)
    })

    //
    it('shall not be able to remove a sale offer', async () => {
      // Try removing a sale offer
      await expect(removeSaleOffer(Eve, saleOfferB.blueprintId)).rejects.toMatch(
        'Missing or mis-typed Storefront.',
      )
      expect.assertions(1)
    })

    //
    it('shall not be able to steal NFTs from another user or admin collection', async () => {
      //
      const thief: FlowAccount = Frank
      const victims: FlowAccount[] = [Eve, Admin]

      for (const victim of victims) {
        // Pick any arbitrary NFT to steal since the promise should be rejected
        // before the check if this NFT exists in victims collection
        const nftID = 1

        await expect(stealNftFromCollection(nftID, victim, [thief])).rejects.toMatch(
          "Couldn't borrow FrontRow collection provider from account.",
        )
      }
      expect.assertions(victims.length)
    })

    //
    it('shall not be able to steal NFTs from the storefront', async () => {
      //
      const thief: FlowAccount = Frank
      const storefrontOwner: FlowAccount = Admin

      await expect(
        stealNftFromStorefront(blueprintC.id, storefrontOwner, thief),
      ).rejects.toMatch("Couldn't borrow Storefront from provided address")

      expect.assertions(1)
    })
  })

  //
  describe('Admin to remove sale offers', () => {
    //
    it('shall be able to remove a sold out sale offer', async () => {
      const saleOffers = await getSaleOffers(Admin)
      const saleOffersCountBefore = saleOffers.length

      // Remove saleOfferA (sold out)
      expect(await shallPass(removeSaleOffer(Admin, saleOfferA.blueprintId))).toEmit([
        {
          type: 'FrontRowStorefront.SaleOfferRemoved',
          data: {
            blueprintId: saleOfferA.blueprintId,
            sold: blueprintA.maxQuantity,
            soldOut: true,
          },
        },
      ])

      // Total sale offers count should decrease by 1
      const saleOffersCountAfter = await getSaleOffersCount(Admin)
      expect(saleOffersCountAfter).toBe(saleOffersCountBefore - 1)
    })

    //
    it('shall be able to remove a sale offer which still has NFTs for sale', async () => {
      const saleOffers = await getSaleOffers(Admin)
      const saleOffersCountBefore = saleOffers.length

      // Remove saleOfferC (not sold out yet)
      expect(await shallPass(removeSaleOffer(Admin, saleOfferC.blueprintId))).toEmit([
        {
          type: 'FrontRowStorefront.SaleOfferRemoved',
          data: {
            blueprintId: saleOfferC.blueprintId,
            sold: 1,
            soldOut: false,
          },
        },
      ])

      // Total sale offers count should decrease by 1
      const saleOffersCountAfter = await getSaleOffersCount(Admin)
      expect(saleOffersCountAfter).toBe(saleOffersCountBefore - 1)
    })

    //
    it('shall not be able to remove a non-existent sale offer', async () => {
      const nonExistentBlueprintId = 1234567890

      // For non-existent blueprint
      await expect(removeSaleOffer(Admin, nonExistentBlueprintId)).rejects.toMatch(
        "Blueprint doesn't exist",
      )

      // For existent blueprint
      await expect(removeSaleOffer(Admin, blueprintD.id)).rejects.toMatch(
        'Missing sale offer.',
      )
      expect.assertions(2)
    })
  })
})
