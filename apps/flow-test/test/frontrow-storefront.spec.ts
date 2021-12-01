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
  blueprintE,
  getBlueprintsCount,
  getMintCountPerBlueprint,
  getBlueprintByMetadata,
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
  saleOfferD,
  saleOfferE,
  saleOfferF,
} from '../src/utils/frontrowStorefront'

import { setupFusdOnAccount, mintFusdToAccount, getBalance } from '../src/utils/fusd'

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(15000)

const accounts = new AccountManager()

//
let Admin: FlowAccount
let Eve: FlowAccount
let Frank: FlowAccount

// Rules to generate test data
const testData = [
  {
    saleOfferFixture: saleOfferA,
    preMintQuantity: saleOfferA.blueprint.maxQuantity,
    shouldCreateSaleOffer: true,
  },
  {
    saleOfferFixture: saleOfferB,
    preMintQuantity: saleOfferB.blueprint.maxQuantity,
    shouldCreateSaleOffer: true,
  },
  {
    saleOfferFixture: saleOfferC,
    preMintQuantity: 0,
    shouldCreateSaleOffer: true,
  },
  {
    saleOfferFixture: saleOfferD,
    preMintQuantity: 0,
    shouldCreateSaleOffer: false,
  },
  {
    saleOfferFixture: saleOfferE,
    preMintQuantity: 0,
    shouldCreateSaleOffer: true,
  },
  {
    saleOfferFixture: saleOfferF,
    preMintQuantity: saleOfferF.blueprint.maxQuantity,
    shouldCreateSaleOffer: true,
  },
]
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
      { account: Frank, amount: 1000 },
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
  describe('Admin sale offers management', () => {
    //
    it('shall be able to print blueprints and create sale offers', async () => {
      const signers = [Admin]
      const recipient = Admin

      // Keep the total count for later verification
      let totalSupply = 0

      //
      for (const el of testData) {
        const { saleOfferFixture, preMintQuantity, shouldCreateSaleOffer } = el
        const blueprintFixture = saleOfferFixture.blueprint
        const { maxQuantity, metadata } = blueprintFixture

        // Print the corresponding blueprint
        await shallPass(printBlueprint(maxQuantity, metadata, signers))

        // Get printed blueprint with the actual ID
        const blueprint = await getBlueprintByMetadata('title', metadata.title)

        // Mint NFTs
        if (preMintQuantity != 0) {
          expect(
            await shallPass(
              batchMintNFT(blueprint.id, preMintQuantity, recipient, signers),
            ),
          )
          totalSupply += preMintQuantity
        }

        // Create a sale offer if the "create" flag is set to true
        if (shouldCreateSaleOffer) {
          const price = toUFix64(saleOfferFixture.price)

          // Create a sale offer
          const createSaleOfferTxResult = await shallPass(
            createSaleOffer(Admin, blueprint.id, price),
          )

          // Check if correct event has been emitted
          expect(createSaleOfferTxResult).toEmit([
            {
              type: 'FrontRowStorefront.SaleOfferAvailable',
            },
          ])

          // Check emitted event data
          expect(createSaleOfferTxResult.events[0].data).toMatchObject({
            storefrontAddress: Admin.address,
            blueprintId: blueprint.id,
            price,
          })
        }

        // Set the blueprintId on the saleOfferFixture
        saleOfferFixture.blueprintId = blueprint.id
      }

      // Check the total blueprints count
      const blueprintsCount = await getBlueprintsCount()
      expect(blueprintsCount).toBe(testData.length)

      // Check the total number of minted NFTs
      const totalNftCount = await getTotalSupply()
      expect(totalNftCount).toBe(totalSupply)
    })

    //
    it('shall have the correct number of sale offers listed for sale', async () => {
      //
      const totalSaleOffers = await getSaleOffersCount(Admin)
      expect(totalSaleOffers).toBe(
        testData.filter((el) => el.shouldCreateSaleOffer).length,
      )
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
        sold: 0,
      })
    })

    //
    it('shall not be able to create a duplicate sale offer', async () => {
      const price = toUFix64(saleOfferA.price)
      const blueprintId = saleOfferA.blueprintId || 0

      // Try creating a duplicate sale offer for a blueprint which is already on sale
      await expect(createSaleOffer(Admin, blueprintId, price)).rejects.toMatch(
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
      const blueprintId = saleOfferA.blueprintId || 0

      // Get NFT that will be sold first
      const nftForSale = await getFrontRowNFTByBlueprint(Admin, blueprintId, 1)
      nftId = nftForSale.id

      const buyNftTxResult = await shallPass(buyNFT(Eve, blueprintId))
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
      const blueprintId = saleOfferA.blueprintId || 0
      await expect(buyNFT(Eve, blueprintId)).rejects.toMatch('NFTs are sold out.')
      expect.assertions(1)
    })

    //
    it('shall not be able to purchase NFTs for a blueprint which is not on sale', async () => {
      //
      const { id: blueprintId } = await getBlueprintByMetadata(
        'title',
        blueprintD.metadata.title,
      )
      await expect(buyNFT(Eve, blueprintId)).rejects.toMatch(
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
      const totalSupply = await getTotalSupply()
      const nextNftId = totalSupply + 1

      const { id: blueprintId } = await getBlueprintByMetadata(
        'title',
        blueprintC.metadata.title,
      )

      // There shouldn't be any pre-minted NFTs for this blueprint
      const mintCount = await getMintCountPerBlueprint(blueprintId)
      expect(mintCount).toBe(0)

      // Since there are no pre-minted NFTs, the purchased NFT should be minted on the fly
      const buyNftTxResult = await shallPass(buyNFT(Eve, blueprintId))
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
          data: { blueprintId, sold: 1, soldOut: false },
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
      const mintCountAfter = await getMintCountPerBlueprint(blueprintId)
      expect(mintCountAfter).toBe(1)
    })

    //
    it('shall not be able to purchase over `maxQuantity` NFTs while minting on demand', async () => {
      const beforeAdminBalance = parseFloat(await getBalance(Admin))
      const beforeEveBalance = parseFloat(await getBalance(Eve))

      const { id: blueprintId, maxQuantity } = await getBlueprintByMetadata(
        'title',
        blueprintE.metadata.title,
      )
      const overMaxQuantity = maxQuantity + 1 // Try purchasing over maxQuantity limit

      // Buy all NFTs from Blueprint E
      for (let i = 0; i < overMaxQuantity; i += 1) {
        if (i < maxQuantity) {
          await shallPass(buyNFT(Eve, blueprintId))
        } else {
          await expect(buyNFT(Eve, blueprintId)).rejects.toMatch('NFTs are sold out.')
        }
      }

      const expectedAdminBalance = beforeAdminBalance + saleOfferE.price * maxQuantity
      const expectedEveBalance = beforeEveBalance - saleOfferE.price * maxQuantity

      const afterAdminBalance = await getBalance(Admin)
      const afterEveBalance = await getBalance(Eve)

      // Make sure the purchase has been reflected correctly in balances of both parties
      expect(afterAdminBalance).toBe(toUFix64(expectedAdminBalance))
      expect(afterEveBalance).toBe(toUFix64(expectedEveBalance))
    })

    //
    it('shall not be able to purchase with insufficient funds to cover the NFT price', async () => {
      // Check the Admin and Eve balances before the purchase
      const balanceEve = await getBalance(Eve)
      const blueprintId = saleOfferF.blueprintId || 0

      // Make sure Eve's balance can't cover the price of the NFT
      expect(parseFloat(balanceEve)).toBeLessThan(saleOfferF.price)

      // Try purchasing NFT without enough funds to cover the price
      await expect(buyNFT(Eve, blueprintId)).rejects.toMatch(
        'Amount withdrawn must be less than or equal than the balance of the Vault',
      )
    })
  })

  //
  describe('Non-admin user purchasing all available NFTs via a sale offer', () => {
    //
    it('shall be able to purchase `maxQuantity` NFTs of Blueprint B', async () => {
      const beforeAdminBalance = parseFloat(await getBalance(Admin))
      const beforeEveBalance = parseFloat(await getBalance(Eve))
      const blueprintId = saleOfferB.blueprintId || 0

      const { maxQuantity } = blueprintB

      // Buy all NFTs from Blueprint B
      for (let i = 0; i < maxQuantity; i += 1) {
        await shallPass(buyNFT(Eve, blueprintId))
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
      const blueprintId = saleOfferB.blueprintId || 0
      await expect(buyNFT(Eve, blueprintId)).rejects.toMatch('NFTs are sold out.')
      expect.assertions(1)
    })
  })

  //
  describe('Non-admin user access', () => {
    //
    it('shall not be able to create a sale offer', async () => {
      const blueprintId = saleOfferB.blueprintId || 0
      // Try creating a sale offer
      await expect(
        createSaleOffer(Eve, blueprintId, toUFix64(saleOfferB.price)),
      ).rejects.toMatch('Missing or mis-typed Storefront.')
      expect.assertions(1)
    })

    //
    it('shall not be able to remove a sale offer', async () => {
      const blueprintId = saleOfferB.blueprintId || 0
      // Try removing a sale offer
      await expect(removeSaleOffer(Eve, blueprintId)).rejects.toMatch(
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
      const blueprintId = saleOfferC.blueprintId || 0

      await expect(
        stealNftFromStorefront(blueprintId, storefrontOwner, thief),
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
      const blueprintId = saleOfferA.blueprintId || 0

      // Remove saleOfferA (sold out)
      expect(await shallPass(removeSaleOffer(Admin, blueprintId))).toEmit([
        {
          type: 'FrontRowStorefront.SaleOfferRemoved',
          data: {
            blueprintId: blueprintId,
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
      const blueprintId = saleOfferC.blueprintId || 0

      // Remove saleOfferC (not sold out yet)
      expect(await shallPass(removeSaleOffer(Admin, blueprintId))).toEmit([
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
      // For non-existent blueprint
      const nonExistentBlueprintId = 1234567890
      await expect(removeSaleOffer(Admin, nonExistentBlueprintId)).rejects.toMatch(
        "Blueprint doesn't exist",
      )

      // For existent blueprint
      const blueprintId = saleOfferD.blueprintId || 0
      await expect(removeSaleOffer(Admin, blueprintId)).rejects.toMatch(
        'Missing sale offer.',
      )
      expect.assertions(2)
    })
  })
})
