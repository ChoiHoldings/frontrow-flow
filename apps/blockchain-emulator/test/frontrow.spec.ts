import { jest, beforeEach, beforeAll, afterAll, it, describe } from '@jest/globals'
import { IFlowAccount, toUFix64 } from '@samatech/onflow-ts'
import {
  deployFrontRow,
  getBlueprint,
  getBlueprints,
  getBlueprintsCount,
  getMintCountPerBlueprint,
  getTotalSupply,
  mintNFT,
  batchMintNFT,
  setupFrontRowCollectionOnAccount,
  hasFrontRowCollection,
  printBlueprint,
  cancelBlueprint,
  getCollectionIDs,
  getFrontRowNFT,
  getBlueprintByMetadata,
  getCollectionNFTs,
  AccountManager,
} from '@ismedia/backend/feature-flow'
import {
  mintFlow,
  stopEmulator,
  testSetup,
} from '@ismedia/backend/feature-blockchain-emulator'
import { shallPass } from './helpers/jest-helpers'
import {
  blueprintA,
  blueprintB,
  blueprintC,
  blueprintD,
  blueprintX,
} from './helpers/test-fixtures'

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(15000)

// Helper variable to keep track of the total minted NFTs
let TOTAL_SUPPLY = 0

const accounts = new AccountManager()
//
let Admin: IFlowAccount
let Eve: IFlowAccount

describe('FrontRow Contract', () => {
  beforeAll(async () => {
    await testSetup(7003)
    Admin = accounts.register('accounts/emulator-account')
    Eve = await accounts.create(Admin, 'accounts/emulator-account-eve')
  })
  beforeEach(() => {
    console.log(expect.getState().currentTestName)
  })

  // Stop emulator, so it could be restarted
  afterAll(async () => {
    await stopEmulator()
  })

  //
  it('deploys FrontRow contract', async () => {
    await mintFlow(Admin, Admin, toUFix64(10.0))
    expect(await deployFrontRow(Admin)).toEmit('FrontRow.ContractInitialized')
  })

  //
  it('supply is 0 after contract is deployed', async () => {
    // Setup
    expect(await hasFrontRowCollection(Admin.address)).toBe(false)

    await shallPass(setupFrontRowCollectionOnAccount(Admin))

    expect(await hasFrontRowCollection(Admin.address)).toBe(true)

    const supply = await getTotalSupply()
    expect(supply).toBe(0)
  })

  //
  it('blueprints count is 0 after contract is deployed', async () => {
    const count = await getBlueprintsCount()
    expect(count).toBe(0)
  })

  //
  describe('Blueprint A - maxQuantity reached', () => {
    //
    it('prints a new Blueprint', async () => {
      const { maxQuantity, metadata } = blueprintA

      const countBefore = await getBlueprintsCount()
      // Create a new Blueprint
      expect(await shallPass(printBlueprint(maxQuantity, metadata, [Admin]))).toEmit([
        {
          type: 'FrontRow.BlueprintPrinted',
          data: {
            id: 1,
            maxQuantity,
          },
        },
      ])
      const countAfter = await getBlueprintsCount()

      // Make sure the total number of blueprints increased by 1
      expect(countBefore + 1).toBe(countAfter)
    })

    //
    it('sets the minted count for the new blueprint to 0', async () => {
      const latestBlueprintID = await getBlueprintsCount()
      const mintedNFTCount = await getMintCountPerBlueprint(latestBlueprintID)

      expect(mintedNFTCount).toBe(0)
    })

    //
    it('mints one NFT from a Blueprint', async () => {
      //
      const { id: blueprintId } = await getBlueprintByMetadata(
        'title',
        blueprintA.metadata.title,
      )
      const recipient = Admin

      // Make sure NFT minting was successful and the correct events were emitted
      expect(await shallPass(mintNFT(blueprintId, recipient.address, [Admin]))).toEmit([
        {
          type: 'FrontRow.Minted',
          data: {
            id: 1,
            blueprintId,
            serialNumber: 1,
          },
        },
        {
          type: 'FrontRow.Deposit',
        },
      ])

      //
      TOTAL_SUPPLY++
    })

    //
    it('updates the mint count for a Blueprint', async () => {
      const latestBlueprintID = await getBlueprintsCount()
      const mintedNFTCount = await getMintCountPerBlueprint(latestBlueprintID)

      // Make sure the mint count has been updated corrected
      expect(mintedNFTCount).toBe(TOTAL_SUPPLY)
    })

    //
    it('cannot mint any more NFTs - max quantity reached', async () => {
      const recipient = Admin
      const { id } = await getBlueprintByMetadata('title', blueprintA.metadata.title)

      await expect(mintNFT(id, recipient.address, [Admin])).rejects.toMatch(
        'maximum quantity limit is reached',
      )
      expect.assertions(1)
    })

    //
    it('has newly minted NFT IDs in the collection', async () => {
      const collectionIDs = await getCollectionIDs(Admin)
      const nftID = 1

      expect(collectionIDs.length).toBe(TOTAL_SUPPLY)
      // NFT with ID=1 is in 0th slot in collection
      expect(collectionIDs[nftID - 1]).toBe(nftID)
    })

    //
    it('has newly minted NFTs in the collection', async () => {
      const collectionNFTs = await getCollectionNFTs(Admin)
      const nftID = 1
      const { id: blueprintId } = await getBlueprintByMetadata(
        'title',
        blueprintA.metadata.title,
      )

      expect(collectionNFTs.length).toBe(TOTAL_SUPPLY)
      // NFT with ID=1 is in 0th slot in collection
      expect(collectionNFTs[nftID - 1].id).toBe(nftID)
      expect(collectionNFTs[nftID - 1].blueprintId).toBe(blueprintId)
      expect(collectionNFTs[nftID - 1].serialNumber).toBe(1)
      expect(collectionNFTs[nftID - 1].metadata).toEqual(blueprintA.metadata)
      expect(collectionNFTs[nftID - 1].owner).toBe(Admin.address)
    })

    //
    it('returns a specific minted NFT from the collection', async () => {
      const nft = await getFrontRowNFT(Admin, 1)

      expect(nft).not.toBe(null)
      expect(nft.serialNumber).toBe(1) // the 1st serial number for this blueprint
      expect(nft.blueprintId).toBe(1)
      expect(nft.metadata.artist).toBe('BTS')
      expect(nft.metadata.title).toBe('Permission to Dance')
    })
  })

  //
  describe('Blueprint B - batch mint', () => {
    //
    it('prints another Blueprint', async () => {
      const { maxQuantity, metadata } = blueprintB
      const countBefore = await getBlueprintsCount()
      const txPrintBlueprint = await printBlueprint(maxQuantity, metadata, [Admin])
      const { id } = await getBlueprintByMetadata('title', blueprintB.metadata.title)

      // Create another Blueprint
      expect(txPrintBlueprint).toEmit([
        {
          type: 'FrontRow.BlueprintPrinted',
          data: {
            id,
            maxQuantity,
          },
        },
      ])
      const countAfter = await getBlueprintsCount()
      expect(countBefore + 1).toBe(countAfter)
    })

    //
    it('has the mint count 0 if no NFTs were minted from a Blueprint', async () => {
      const { id } = await getBlueprintByMetadata('title', blueprintB.metadata.title)
      const mintCount = await getMintCountPerBlueprint(id)
      expect(mintCount).toBe(0)
    })

    //
    it('batch mints NFTs from the enabled Blueprint', async () => {
      const { id: blueprintId, maxQuantity } = await getBlueprintByMetadata(
        'title',
        blueprintB.metadata.title,
      )
      const recipient = Admin

      // Make sure the correct events were emitted
      expect(
        await shallPass(batchMintNFT(blueprintId, maxQuantity, recipient, [Admin])),
      ).toEmit([
        {
          type: 'FrontRow.Minted',
          data: {
            id: 2,
            blueprintId,
            serialNumber: 1,
          },
        },
        {
          type: 'FrontRow.Deposit',
        },
      ])
    })

    //
    it('has the correct mint count after batch mint', async () => {
      const { id, maxQuantity } = await getBlueprintByMetadata(
        'title',
        blueprintB.metadata.title,
      )
      const mintCount = await getMintCountPerBlueprint(id)

      expect(mintCount).toBe(maxQuantity)
      TOTAL_SUPPLY = TOTAL_SUPPLY + maxQuantity
    })

    //
    it(`has the total supply number increased to ${TOTAL_SUPPLY} after batch mint`, async () => {
      const supply = await getTotalSupply()
      expect(supply).toBe(TOTAL_SUPPLY)
    })
  })

  //
  describe('Blueprint C - canceled', () => {
    //
    it('cancel a Blueprint', async () => {
      // Print a blueprint first
      const { maxQuantity, metadata } = blueprintC
      await shallPass(printBlueprint(maxQuantity, metadata, [Admin]))
      const { id } = await getBlueprintByMetadata('title', blueprintC.metadata.title)

      // Make sure the correct event was emitted
      expect(await shallPass(cancelBlueprint(id, [Admin]))).toEmit([
        {
          type: 'FrontRow.BlueprintCancelled',
          data: {
            id,
          },
        },
      ])
    })

    //
    it('sets corresponding flag to true on the canceled Blueprint', async () => {
      // Check via getBlueprints
      const blueprints = await getBlueprints()
      const { id } = await getBlueprintByMetadata('title', blueprintC.metadata.title)

      // Make sure the flag was set correctly
      expect(blueprints[id].cancelled).toBe(true)

      // Check via getBlueprint
      const blueprint = await getBlueprint(id)
      expect(blueprint.cancelled).toBe(true)
    })

    //
    it('cannot mint NFTs for the canceled Blueprint', async () => {
      const recipient = Admin
      const { id } = await getBlueprintByMetadata('title', blueprintC.metadata.title)

      await expect(mintNFT(id, recipient.address, [Admin])).rejects.toMatch(
        'blueprint is cancelled.',
      )
      expect.assertions(1)
    })
  })

  //
  describe('Admin NFT collection', () => {
    //
    it('has newly minted NFTs in the collection', async () => {
      const collectionIDs = await getCollectionIDs(Admin)

      // Use an arbitrary ID=3 for this test
      const nftID = 3

      expect(collectionIDs.length).toBe(TOTAL_SUPPLY)
      // NFT with ID=3 is in 2nd slot in collection since slots start from 0
      expect(collectionIDs[nftID - 1]).toBe(nftID)
    })

    //
    it('returns a specific minted NFT from the collection', async () => {
      const nft = await getFrontRowNFT(Admin, 2)

      expect(nft).not.toBe(null)
      expect(nft.serialNumber).toBe(1) // the first serial number for this blueprint
      expect(nft.blueprintId).toBe(2)
      expect(nft.metadata.artist).toBe('Exo')
      expect(nft.metadata.title).toBe('Obsession')
    })

    //
    it('returns null for non-existent NFT ID', async () => {
      const NOT_EXISTENT_ID = 10000

      const nft = await getFrontRowNFT(Admin, NOT_EXISTENT_ID)
      expect(nft).toBe(null)
    })
  })

  //
  describe('Non-admin user access', () => {
    //
    it('cannot print a Blueprint', async () => {
      const { maxQuantity, metadata } = blueprintD
      const signers = [Eve]

      await expect(printBlueprint(maxQuantity, metadata, signers)).rejects.toMatch(
        'Could not borrow a reference to the Admin.',
      )
      expect.assertions(1)
    })

    //
    it('cannot cancel a Blueprint', async () => {
      const { id } = await getBlueprintByMetadata('title', blueprintB.metadata.title)
      const signers = [Eve]

      await expect(cancelBlueprint(id, signers)).rejects.toMatch(
        'Could not borrow a reference to the Admin.',
      )
      expect.assertions(1)
    })

    //
    it('cannot mint one NFT from a Blueprint', async () => {
      //
      const { id: blueprintId } = await getBlueprintByMetadata(
        'title',
        blueprintA.metadata.title,
      )

      const recipient = Eve
      const signers = [Eve]

      await expect(mintNFT(blueprintId, recipient.address, signers)).rejects.toMatch(
        'Could not borrow a reference to the Admin.',
      )
      expect.assertions(1)
    })

    //
    it('cannot batch mint NFTs', async () => {
      const { id: blueprintId } = await getBlueprintByMetadata(
        'title',
        blueprintB.metadata.title,
      )

      const recipient = Eve
      const signers = [Eve]

      await expect(batchMintNFT(blueprintId, 10, recipient, signers)).rejects.toMatch(
        'Could not borrow a reference to the Admin.',
      )
      expect.assertions(1)
    })
  })

  //
  describe('Computational limits', () => {
    //
    it('cannot batch mint over specific max at once', async () => {
      const { maxQuantity, metadata } = blueprintX

      const countBefore = await getBlueprintsCount()
      // Create a new Blueprint
      expect(await shallPass(printBlueprint(maxQuantity, metadata, [Admin]))).toEmit([
        {
          type: 'FrontRow.BlueprintPrinted',
        },
      ])
      const countAfter = await getBlueprintsCount()

      // Make sure the total number of blueprints increased by 1
      expect(countBefore + 1).toBe(countAfter)

      // Get the id of the blueprintX
      const { id: blueprintId } = await getBlueprintByMetadata(
        'title',
        blueprintX.metadata.title,
      )

      // Try batch minting a large number of NFTs at once
      const recipient = Admin
      const MAX_MINT_QUANTITY_AT_ONCE = 220

      // Expect the system to complaint about exceeding the computational limits
      await expect(
        batchMintNFT(blueprintId, MAX_MINT_QUANTITY_AT_ONCE, recipient, [Admin]),
      ).rejects.toMatch('computation limited exceeded')
    })
  })

  //
  describe('Internal scripts', () => {
    //
    it('returns a blueprint for provided metadata', async () => {
      const { metadata } = blueprintA
      const blueprint = await getBlueprintByMetadata('title', metadata.title)

      expect(blueprint.metadata.title).toBe(metadata.title)
    })

    //
    it('returns null for a bogus metadata', async () => {
      const blueprint = await getBlueprintByMetadata('title', 'bogus title')

      expect(blueprint).toBe(null)
    })
  })
})
