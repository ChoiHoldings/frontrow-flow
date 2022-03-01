import { jest, beforeEach, beforeAll, afterAll, it, describe } from '@jest/globals'
import {
  IFlowAccount,
  toUFix64,
  mintFusdToAccount,
  getFusdBalance,
  deployFusd,
  setupFusdOnAccount,
  deploy,
  setContractAddress,
} from '@samatech/onflow-ts'
import {
  AccountManager,
  getTotalSupply,
  batchMintNFT,
  setupFrontRowCollectionOnAccount,
  printBlueprint,
  getCollectionIDs,
  getFrontRowNFTByBlueprint,
  getBlueprintsCount,
  getMintCountPerBlueprint,
  deployFrontRowStorefront,
  createSaleOffer,
  printBlueprintCreateSaleOffer,
  removeSaleOffer,
  buyNFT,
  getSaleOfferDetails,
  getSaleOffersCount,
  getSaleOffers,
  getBlueprintByMetadata,
  isNftOwner,
  hasFrontRowCollection,
  destroyFrontRowCollectionOnAccount,
} from '@ismedia/backend/feature-flow'
import {
  mintFlow,
  stopEmulator,
  testSetup,
} from '@ismedia/backend/feature-blockchain-emulator'
import { shallPass } from './helpers/jest-helpers'
import { stealNftFromCollection, stealNftFromStorefront } from './helpers/security'
import {
  blueprintA,
  blueprintB,
  blueprintC,
  blueprintD,
  blueprintE,
  blueprintG,
  saleOfferA,
  saleOfferB,
  saleOfferC,
  saleOfferD,
  saleOfferE,
  saleOfferF,
  saleOfferG,
} from './helpers/test-fixtures'

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(15000)

const accounts = new AccountManager()

//
let Admin: IFlowAccount
let Eve: IFlowAccount
let Frank: IFlowAccount

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
// Data for printing a blueprint and creating a sale offer in a single tx
const printCreateData = {
  saleOfferFixture: saleOfferG,
  preMintQuantity: 1,
}
let buyers: { account: IFlowAccount; amount: number }[] = []

interface ExpectedBuyEventProps {
  seller: IFlowAccount
  buyer: IFlowAccount
  blueprintId: number
  nftId: number
  priceUFix64: string
  serialNumber?: number
  soldOut?: boolean
}

// Helper for determining the expected events from a buy_nft tx
const expectedBuyEvents = (buyEventProps: ExpectedBuyEventProps) => {
  const { seller, buyer, blueprintId, nftId, priceUFix64, serialNumber, soldOut } =
    buyEventProps
  return [
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
      data: { amount: priceUFix64, to: seller.address },
    },
    {
      type: 'FrontRowStorefront.Purchase',
      data: { blueprintId, serialNumber: serialNumber ?? 1, soldOut: !!soldOut },
    },
    {
      type: 'FrontRow.Deposit',
      data: { id: nftId, to: buyer.address },
    },
  ]
}

describe('FrontRowStorefront Contract', () => {
  beforeAll(async () => {
    await testSetup(7004)
    Admin = accounts.register('accounts/emulator-account')
    Eve = await accounts.create(Admin, 'accounts/emulator-account-eve')
    Frank = await accounts.create(Admin, 'accounts/emulator-account-frank')
    buyers = [
      { account: Eve, amount: 100 },
      { account: Frank, amount: 1000 },
    ]
  })
  beforeEach(() => {
    console.log(expect.getState().currentTestName)
  })

  // Stop emulator, so it could be restarted
  afterAll(async () => {
    await stopEmulator()
  })

  //
  it('deploys FrontRowStorefront contract', async () => {
    await mintFlow(Admin, Admin, toUFix64(10.0))
    await deployFusd(Admin)
    await setupFusdOnAccount(Admin)
    expect(await shallPass(deployFrontRowStorefront(Admin))).toEmit(
      'FrontRowStorefront.ContractInitialized',
    )
  })

  //
  it('sets up FrontRow Collection on accounts', async () => {
    expect(await shallPass(setupFrontRowCollectionOnAccount(Admin)))
    expect(await shallPass(setupFrontRowCollectionOnAccount(Frank)))
    // Explicitly avoid setting up Eve's account, to verify that the buy_nft
    // transaction will correctly set up a FrontRow collection if none exists
  })

  //
  it('does not have any sale offers listed for sale', async () => {
    //
    const totalSaleOffers = await getSaleOffersCount(Admin)
    expect(totalSaleOffers).toBe(0)
  })

  //
  it('sets up buyer accounts', async () => {
    // Setup buyer accounts
    for (const buyer of buyers) {
      await setupFusdOnAccount(buyer.account)
      await mintFusdToAccount(Admin, buyer.account, buyer.amount)

      // Add FUSD to account balance
      const balance = await getFusdBalance(buyer.account)
      expect(balance).toBe(toUFix64(buyer.amount))
    }
  })

  //
  describe('Admin sale offers management', () => {
    //
    it('prints blueprints and create sale offers', async () => {
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
          const price = saleOfferFixture.price

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
            price: toUFix64(price / 100),
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
    it('has the correct number of sale offers listed for sale', async () => {
      //
      const totalSaleOffers = await getSaleOffersCount(Admin)
      expect(totalSaleOffers).toBe(
        testData.filter((el) => el.shouldCreateSaleOffer).length,
      )
    })

    //
    it('has the correct sale offer listed for sale', async () => {
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
    it('cannot create a duplicate sale offer', async () => {
      const price = saleOfferA.price
      const blueprintId = saleOfferA.blueprintId || 0

      // Try creating a duplicate sale offer for a blueprint which is already on sale
      await expect(createSaleOffer(Admin, blueprintId, price)).rejects.toMatch(
        'Sale offer already exists.',
      )
      expect.assertions(1)
    })

    it('prints a blueprint and create a sale offer in a single transaction', async () => {
      const seller = Admin
      const recipient = Admin
      const { saleOfferFixture, preMintQuantity } = printCreateData
      const { price, blueprint } = saleOfferFixture
      const { maxQuantity, metadata } = blueprint

      // Print the blueprint and create the sale offer
      const printCreateResult = await shallPass(
        printBlueprintCreateSaleOffer(seller, maxQuantity, metadata, price),
      )

      // Check if correct events are emitted
      expect(printCreateResult).toEmit([
        { type: 'FrontRowStorefront.SaleOfferAvailable' },
        { type: 'FrontRow.BlueprintPrinted' },
      ])

      // Get printed blueprint with the actual ID
      const flowBlueprint = await getBlueprintByMetadata('title', metadata.title)

      // Set the blueprintId on the saleOfferFixture
      saleOfferFixture.blueprintId = flowBlueprint.id

      // Mint NFTs
      expect(
        await shallPass(
          batchMintNFT(flowBlueprint.id, preMintQuantity, recipient, [Admin]),
        ),
      )
    })
  })

  //
  describe('Non-admin user purchasing one NFT via a sale offer', () => {
    // Keep track of nftId for different tests
    let nftId: number

    it('does not have a FrontRow collection set up before purchasing', async () => {
      await expect(getCollectionIDs(Eve)).rejects.toThrowError(
        'Could not borrow capability from public collection',
      )
    })

    //
    it('purchases one pre-minted NFT via a sale offer', async () => {
      // Check the Admin and Eve balances before the purchase
      const beforeAdminBalance = await getFusdBalance(Admin)
      const beforeEveBalance = await getFusdBalance(Eve)
      const blueprintId = saleOfferA.blueprintId || 0

      // Get NFT that will be sold first
      const nftForSale = await getFrontRowNFTByBlueprint(Admin, blueprintId, 1)
      nftId = nftForSale.id

      const buyNftTxResult = await shallPass(buyNFT(Eve, blueprintId))
      const listedPriceUFix64 = toUFix64(saleOfferA.price / 100)

      // Check transaction details in the emitted event
      expect(buyNftTxResult).toEmit(
        expectedBuyEvents({
          seller: Admin,
          buyer: Eve,
          blueprintId,
          nftId,
          priceUFix64: listedPriceUFix64,
          soldOut: true,
        }),
      )

      // Check Eve owns the NFT
      const isOwner = await isNftOwner(Eve.address, blueprintId, 1)
      expect(isOwner).toBe(true)

      // Check the balances after the purchase
      const afterAdminBalance = await getFusdBalance(Admin)
      const afterEveBalance = await getFusdBalance(Eve)

      const expectedAdminBalance = parseFloat(beforeAdminBalance) + saleOfferA.price / 100
      const expectedEveBalance = parseFloat(beforeEveBalance) - saleOfferA.price / 100

      // Make sure the purchase has been reflected correctly in balances of both parties
      expect(afterAdminBalance).toBe(toUFix64(expectedAdminBalance))
      expect(afterEveBalance).toBe(toUFix64(expectedEveBalance))
    })

    //
    it("moves purchased NFT into buyer's collection", async () => {
      // Eve should have a FrontRow collection after calling buy_nft
      const purchaserCollectionIDs = await getCollectionIDs(Eve)

      // Check if correct NFT has been purchased
      expect(purchaserCollectionIDs.length).toBe(1)
      expect(purchaserCollectionIDs[0]).toBe(nftId)
    })

    //
    it("removes the purchased NFT from the seller's collection", async () => {
      const sellerCollectionIDs = await getCollectionIDs(Admin)

      // Make sure Admin no longer has this NFT in its collection
      expect(sellerCollectionIDs.includes(nftId)).toBe(false)
    })

    //
    it('cannot purchase NFTs when they are sold out', async () => {
      //
      const blueprintId = saleOfferA.blueprintId || 0
      await expect(buyNFT(Eve, blueprintId)).rejects.toMatch('NFTs are sold out.')
      expect.assertions(1)
    })

    //
    it('cannot purchase NFTs for a blueprint which is not on sale', async () => {
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
    it('purchases one on demand minted NFT via a sale offer', async () => {
      // Check the Admin and Eve balances before the purchase
      const beforeAdminBalance = await getFusdBalance(Admin)
      const beforeEveBalance = await getFusdBalance(Eve)

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
      const listedPriceUFix64 = toUFix64(saleOfferC.price / 100)

      // Check transaction details in the emitted event
      // Make sure the "FrontRow.Withdraw" event didn't fire since we've minted on demand
      expect(buyNftTxResult).toEmit(
        expectedBuyEvents({
          seller: Admin,
          buyer: Eve,
          blueprintId,
          nftId: nextNftId,
          priceUFix64: listedPriceUFix64,
        }),
      )

      // Check the balances after the purchase
      const afterAdminBalance = await getFusdBalance(Admin)
      const afterEveBalance = await getFusdBalance(Eve)

      // Prep balances for comparison
      const expectedAdminBalance = parseFloat(beforeAdminBalance) + saleOfferC.price / 100
      const expectedEveBalance = parseFloat(beforeEveBalance) - saleOfferC.price / 100

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
    it('cannot purchase over `maxQuantity` NFTs while minting on demand', async () => {
      const beforeAdminBalance = parseFloat(await getFusdBalance(Admin))
      const beforeEveBalance = parseFloat(await getFusdBalance(Eve))

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

      const expectedAdminBalance =
        beforeAdminBalance + (saleOfferE.price / 100) * maxQuantity
      const expectedEveBalance = beforeEveBalance - (saleOfferE.price / 100) * maxQuantity

      const afterAdminBalance = await getFusdBalance(Admin)
      const afterEveBalance = await getFusdBalance(Eve)

      // Make sure the purchase has been reflected correctly in balances of both parties
      expect(afterAdminBalance).toBe(toUFix64(expectedAdminBalance))
      expect(afterEveBalance).toBe(toUFix64(expectedEveBalance))
    })

    //
    it('cannot purchase with insufficient funds to cover the NFT price', async () => {
      // Check the Admin and Eve balances before the purchase
      const balanceEve = await getFusdBalance(Eve)
      const blueprintId = saleOfferF.blueprintId || 0

      // Make sure Eve's balance can't cover the price of the NFT
      expect(parseFloat(balanceEve)).toBeLessThan(saleOfferF.price)

      // Try purchasing NFT without enough funds to cover the price
      await expect(buyNFT(Eve, blueprintId)).rejects.toMatch(
        'Amount withdrawn must be less than or equal than the balance of the Vault',
      )
    })

    it('purchases NFTs from a sale offer created together with blueprint', async () => {
      // Check the Admin and Eve balances before the purchase
      const beforeAdminBalance = await getFusdBalance(Admin)
      const beforeEveBalance = await getFusdBalance(Eve)

      const { id: blueprintId } = await getBlueprintByMetadata(
        'title',
        blueprintG.metadata.title,
      )

      // Get NFT that will be sold first
      const nftForSale = await getFrontRowNFTByBlueprint(Admin, blueprintId, 1)
      nftId = nftForSale.id

      // Get ID of the NFT that should be sold next
      const totalSupply = await getTotalSupply()
      const nextNftId = totalSupply + 1

      // Verify premint count
      const mintCount = await getMintCountPerBlueprint(blueprintId)
      expect(mintCount).toBe(printCreateData.preMintQuantity)

      const buyNftTxResult1 = await shallPass(buyNFT(Eve, blueprintId))
      const listedPriceUFix64 = toUFix64(saleOfferG.price / 100)

      // Check transaction details in the emitted event
      // Make sure the "FrontRow.Withdraw" event didn't fire since we've minted on demand
      expect(buyNftTxResult1).toEmit(
        expectedBuyEvents({
          seller: Admin,
          buyer: Eve,
          blueprintId,
          nftId,
          priceUFix64: listedPriceUFix64,
        }),
      )

      // Check the balances after the purchase
      const afterAdminBalance = await getFusdBalance(Admin)
      const afterEveBalance = await getFusdBalance(Eve)

      // Prep balances for comparison
      const expectedAdminBalance = parseFloat(beforeAdminBalance) + saleOfferG.price / 100
      const expectedEveBalance = parseFloat(beforeEveBalance) - saleOfferG.price / 100

      // Make sure the purchase has been reflected correctly in balances of both parties
      expect(afterAdminBalance).toBe(toUFix64(expectedAdminBalance))
      expect(afterEveBalance).toBe(toUFix64(expectedEveBalance))

      // The mint count should not increment
      const mintCountAfterFirst = await getMintCountPerBlueprint(blueprintId)
      expect(mintCountAfterFirst).toBe(mintCount)

      // Since there are no more pre-minted NFTs, the next purchased NFT should be minted on demand
      const buyNftTxResult2 = await shallPass(buyNFT(Eve, blueprintId))

      // Check transaction details in the emitted event
      // Make sure the "FrontRow.Withdraw" event didn't fire since we've minted on demand
      expect(buyNftTxResult2).toEmit(
        expectedBuyEvents({
          seller: Admin,
          buyer: Eve,
          blueprintId,
          nftId: nextNftId,
          priceUFix64: listedPriceUFix64,
          serialNumber: 2,
        }),
      )
      // The mint count should increment
      const mintCountAfterSecond = await getMintCountPerBlueprint(blueprintId)
      expect(mintCountAfterSecond).toBe(mintCount + 1)
    })
  })

  //
  describe('Non-admin user purchasing all available NFTs via a sale offer', () => {
    //
    it('purchases `maxQuantity` NFTs of Blueprint B', async () => {
      const beforeAdminBalance = parseFloat(await getFusdBalance(Admin))
      const beforeEveBalance = parseFloat(await getFusdBalance(Eve))
      const blueprintId = saleOfferB.blueprintId || 0

      const { maxQuantity } = blueprintB

      // Buy all NFTs from Blueprint B
      for (let i = 0; i < maxQuantity; i += 1) {
        await shallPass(buyNFT(Eve, blueprintId))
      }

      const expectedAdminBalance =
        beforeAdminBalance + (saleOfferB.price / 100) * maxQuantity
      const expectedEveBalance = beforeEveBalance - (saleOfferB.price / 100) * maxQuantity

      const afterAdminBalance = await getFusdBalance(Admin)
      const afterEveBalance = await getFusdBalance(Eve)

      // Make sure the purchase has been reflected correctly in balances of both parties
      expect(afterAdminBalance).toBe(toUFix64(expectedAdminBalance))
      expect(afterEveBalance).toBe(toUFix64(expectedEveBalance))
    })

    it('cannot purchase more than `maxQuantity` NFTs', async () => {
      //
      const blueprintId = saleOfferB.blueprintId || 0
      await expect(buyNFT(Eve, blueprintId)).rejects.toMatch('NFTs are sold out.')
      expect.assertions(1)
    })
  })

  //
  describe('Non-admin user access', () => {
    //
    it('cannot create a sale offer', async () => {
      const blueprintId = saleOfferB.blueprintId || 0
      // Try creating a sale offer
      await expect(createSaleOffer(Eve, blueprintId, saleOfferB.price)).rejects.toMatch(
        'Missing or mis-typed Storefront.',
      )
      expect.assertions(1)
    })

    //
    it('cannot remove a sale offer', async () => {
      const blueprintId = saleOfferB.blueprintId || 0
      // Try removing a sale offer
      await expect(removeSaleOffer(Eve, blueprintId)).rejects.toMatch(
        'Missing or mis-typed Storefront.',
      )
      expect.assertions(1)
    })

    //
    it('cannot steal NFTs from another user or admin collection', async () => {
      //
      const thief: IFlowAccount = Frank
      const victims: IFlowAccount[] = [Eve, Admin]

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
    it('cannot steal NFTs from the storefront', async () => {
      //
      const thief: IFlowAccount = Frank
      const storefrontOwner: IFlowAccount = Admin
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
    it('removes a sold out sale offer', async () => {
      const saleOffers = await getSaleOffers(Admin)
      const saleOffersCountBefore = saleOffers.length
      const blueprintId = saleOfferA.blueprintId || 0

      // Remove saleOfferA (sold out)
      expect(await shallPass(removeSaleOffer(Admin, blueprintId))).toEmit([
        {
          type: 'FrontRowStorefront.SaleOfferRemoved',
          data: {
            blueprintId: blueprintId,
            serialNumber: blueprintA.maxQuantity,
            soldOut: true,
          },
        },
      ])

      // Total sale offers count should decrease by 1
      const saleOffersCountAfter = await getSaleOffersCount(Admin)
      expect(saleOffersCountAfter).toBe(saleOffersCountBefore - 1)
    })

    //
    it('removes a sale offer which still has NFTs for sale', async () => {
      const saleOffers = await getSaleOffers(Admin)
      const saleOffersCountBefore = saleOffers.length
      const blueprintId = saleOfferC.blueprintId || 0

      // Remove saleOfferC (not sold out yet)
      expect(await shallPass(removeSaleOffer(Admin, blueprintId))).toEmit([
        {
          type: 'FrontRowStorefront.SaleOfferRemoved',
          data: {
            blueprintId: saleOfferC.blueprintId,
            serialNumber: 1,
            soldOut: false,
          },
        },
      ])

      // Total sale offers count should decrease by 1
      const saleOffersCountAfter = await getSaleOffersCount(Admin)
      expect(saleOffersCountAfter).toBe(saleOffersCountBefore - 1)
    })

    //
    it('cannot remove a non-existent sale offer', async () => {
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

  // As part of a staging data reset, contracts are deployed to a new address
  // Existing testnet accounts must destroy their old collection and create a new one
  describe('Deploy contracts to new address', () => {
    it('re-deploys contracts, destroys the old collection, and creates a new one', async () => {
      // Ensure Frank has an NFT in his collection (Eve has already made a purchase)
      const { id: oldBlueprintId } = await getBlueprintByMetadata(
        'title',
        blueprintG.metadata.title,
      )
      await shallPass(buyNFT(Frank, oldBlueprintId))

      // Deploy a new FrontRow contract and FrontRowStorefront to Eve's account
      expect(await deploy({ name: 'FrontRow', auth: Eve })).toEmit(
        'FrontRow.ContractInitialized',
      )
      expect(await deploy({ name: 'FrontRowStorefront', auth: Eve })).toEmit(
        'FrontRowStorefront.ContractInitialized',
      )
      expect(await getTotalSupply()).toBe(0)

      // Frank doesn't have a collection for the new contract
      expect(await hasFrontRowCollection(Frank.address)).toBe(false)

      // Destroy Eve and Frank's old collections
      setContractAddress('FrontRow', Admin.address)
      expect(await hasFrontRowCollection(Frank.address)).toBe(true)
      await shallPass(destroyFrontRowCollectionOnAccount(Frank))
      await shallPass(destroyFrontRowCollectionOnAccount(Eve))
      expect(await hasFrontRowCollection(Frank.address)).toBe(false)

      // Set up new collections for Eve and Frank
      setContractAddress('FrontRow', Eve.address)
      await shallPass(setupFrontRowCollectionOnAccount(Eve))
      await shallPass(setupFrontRowCollectionOnAccount(Frank))
      expect(await hasFrontRowCollection(Frank.address)).toBe(true)

      // Print a new Blueprint and create the sale offer
      const { saleOfferFixture } = printCreateData
      const { price, blueprint } = saleOfferFixture
      const { maxQuantity, metadata } = blueprint
      const blueprintId = 1 // First and only Blueprint in the new contract
      await shallPass(printBlueprintCreateSaleOffer(Eve, maxQuantity, metadata, price))

      // Purchase one NFT
      const buyNftTxResult = await shallPass(buyNFT(Frank, blueprintId))
      const listedPriceUFix64 = toUFix64(price / 100)

      // Check transaction details in the emitted event
      expect(buyNftTxResult).toEmit(
        expectedBuyEvents({
          seller: Eve,
          buyer: Frank,
          blueprintId,
          nftId: 1,
          priceUFix64: listedPriceUFix64,
          soldOut: false,
        }),
      )

      // Check Eve owns the NFT
      const isOwner = await isNftOwner(Frank.address, blueprintId, 1)
      expect(isOwner).toBe(true)
    })
  })
})
