import { jest, beforeEach, beforeAll, afterAll, it, describe } from '@jest/globals'
import { FlowAccount } from '@ismedia/shared/util-flow'
import { AccountManager } from '../src/lib/accounts'
import { stopEmulator, testSetup } from '../src/lib/common'
import { shallPass } from '../src/lib/jest-helpers'
import { TEST_CONFIG } from '../src/utils/config'

import {
  deployFrontRow,
  getBlueprints,
  getBlueprintsCount,
  getMintCountPerBlueprint,
  getTotalSupply,
  mintNFT,
  batchMintNFT,
  setupFrontRowCollectionOnAccount,
  printBlueprint,
  cancelBlueprint,
  getCollectionIDs,
  blueprintA,
  blueprintB,
  blueprintC,
  blueprintD,
  blueprintX,
  getFrontRowNFT,
  getBlueprintByMetadata,
} from '../src/utils/frontrow'

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(15000)

// Helper variable to keep track of the total minted NFTs
let TOTAL_SUPPLY = 0

const accounts = new AccountManager()
//
let Admin: FlowAccount
let Eve: FlowAccount

describe('FrontRow Contract', () => {
  beforeAll(async () => {
    await testSetup({
      port: 7003,
      basePath: TEST_CONFIG.BASE_PATH,
      cdcDirectories: TEST_CONFIG.CDC_DIRECTORIES,
    })
    Admin = accounts.register('accounts/emulator-account')
    Eve = await accounts.create(Admin, 'accounts/emulator-account-eve')
  })
  beforeEach(async () => {
    console.log(expect.getState().currentTestName)
  })

  // Stop emulator, so it could be restarted
  afterAll(async () => {
    await stopEmulator()
  })

  //
  it('shall deploy FrontRow contract', async () => {
    expect(await deployFrontRow(Admin)).toEmit('FrontRow.ContractInitialized')
  })

  //
  it('supply shall be 0 after contract is deployed', async () => {
    // Setup
    await shallPass(setupFrontRowCollectionOnAccount(Admin))

    const supply = await getTotalSupply()
    expect(supply).toBe(0)
  })

  //
  it('blueprints count shall be 0 after contract is deployed', async () => {
    const count = await getBlueprintsCount()
    expect(count).toBe(0)
  })

  //
  describe('Blueprint A - maxQuantity reached', () => {
    //
    it('shall be able to print a new Blueprint', async () => {
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
    it('shall set the minted count for the new blueprint to 0', async () => {
      const latestBlueprintID = await getBlueprintsCount()
      const mintedNFTCount = await getMintCountPerBlueprint(latestBlueprintID)

      expect(mintedNFTCount).toBe(0)
    })

    //
    it('shall be able to mint one NFT from a Blueprint', async () => {
      //
      const { id: blueprintId } = await getBlueprintByMetadata(
        'title',
        blueprintA.metadata.title,
      )
      const recipient = Admin

      // Make sure NFT minting was successful and the correct events were emitted
      expect(await shallPass(mintNFT(blueprintId, recipient, [Admin]))).toEmit([
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
    it('shall update the mint count for a Blueprint', async () => {
      const latestBlueprintID = await getBlueprintsCount()
      const mintedNFTCount = await getMintCountPerBlueprint(latestBlueprintID)

      // Make sure the mint count has been updated corrected
      expect(mintedNFTCount).toBe(TOTAL_SUPPLY)
    })

    //
    it('shall not be able to mint any more NFTs - max quantity reached', async () => {
      const recipient = Admin
      const { id } = await getBlueprintByMetadata('title', blueprintA.metadata.title)

      await expect(mintNFT(id, recipient, [Admin])).rejects.toMatch(
        'maximum quantity limit is reached',
      )
      expect.assertions(1)
    })

    //
    it('shall have newly minted NFTs in the collection', async () => {
      const collectionIDs = await getCollectionIDs(Admin)
      const nftID = 1

      expect(collectionIDs.length).toBe(TOTAL_SUPPLY)
      // NFT with ID=1 is in 0th slot in collection
      expect(collectionIDs[nftID - 1]).toBe(nftID)
    })

    //
    it('shall return a specific minted NFT from the collection', async () => {
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
    it('shall be able to print another Blueprint', async () => {
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
    it('shall have the mint count 0 if no NFTs were minted from a Blueprint', async () => {
      const { id } = await getBlueprintByMetadata('title', blueprintB.metadata.title)
      const mintCount = await getMintCountPerBlueprint(id)
      expect(mintCount).toBe(0)
    })

    //
    it('shall be able to batch mint NFTs from the enabled Blueprint', async () => {
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
    it('shall have the correct mint count after batch mint', async () => {
      const { id, maxQuantity } = await getBlueprintByMetadata(
        'title',
        blueprintB.metadata.title,
      )
      const mintCount = await getMintCountPerBlueprint(id)

      expect(mintCount).toBe(maxQuantity)
      TOTAL_SUPPLY = TOTAL_SUPPLY + maxQuantity
    })

    //
    it(`shall have the total supply number increased to ${TOTAL_SUPPLY} after batch mint`, async () => {
      const supply = await getTotalSupply()
      expect(supply).toBe(TOTAL_SUPPLY)
    })
  })

  //
  describe('Blueprint C - cancelled', () => {
    //
    it('shall be able to cancel a Blueprint', async () => {
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
    it('shall set corresponding flag to true on the cancelled Blueprint', async () => {
      const blueprints = await getBlueprints()
      const { id } = await getBlueprintByMetadata('title', blueprintC.metadata.title)
      const isCancelled = blueprints[id].cancelled

      // Make sure the flag was set correctly
      expect(isCancelled).toBe(true)
    })

    //
    it('shall not be able to mint NFTs for the cancelled Blueprint', async () => {
      const recipient = Admin
      const { id } = await getBlueprintByMetadata('title', blueprintC.metadata.title)

      await expect(mintNFT(id, recipient, [Admin])).rejects.toMatch(
        'blueprint is cancelled.',
      )
      expect.assertions(1)
    })
  })

  //
  describe('Admin NFT collection', () => {
    //
    it('shall have newly minted NFTs in the collection', async () => {
      const collectionIDs = await getCollectionIDs(Admin)

      // Use an arbitrary ID=3 for this test
      const nftID = 3

      expect(collectionIDs.length).toBe(TOTAL_SUPPLY)
      // NFT with ID=3 is in 2nd slot in collection since slots start from 0
      expect(collectionIDs[nftID - 1]).toBe(nftID)
    })

    //
    it('shall return a specific minted NFT from the collection', async () => {
      const nft = await getFrontRowNFT(Admin, 2)

      expect(nft).not.toBe(null)
      expect(nft.serialNumber).toBe(1) // the first serial number for this blueprint
      expect(nft.blueprintId).toBe(2)
      expect(nft.metadata.artist).toBe('Exo')
      expect(nft.metadata.title).toBe('Obsession')
    })

    //
    it('should return null for non-existent NFT ID', async () => {
      const NOT_EXISTENT_ID = 10000

      const nft = await getFrontRowNFT(Admin, NOT_EXISTENT_ID)
      expect(nft).toBe(null)
    })
  })

  //
  describe('Non-admin user access', () => {
    //
    it('shall not be able to print a Blueprint', async () => {
      const { maxQuantity, metadata } = blueprintD
      const signers = [Eve]

      await expect(printBlueprint(maxQuantity, metadata, signers)).rejects.toMatch(
        'Could not borrow a reference to the Admin.',
      )
      expect.assertions(1)
    })

    //
    it('shall not be able to cancel a Blueprint', async () => {
      const { id } = await getBlueprintByMetadata('title', blueprintB.metadata.title)
      const signers = [Eve]

      await expect(cancelBlueprint(id, signers)).rejects.toMatch(
        'Could not borrow a reference to the Admin.',
      )
      expect.assertions(1)
    })

    //
    it('shall not be able to mint one NFT from a Blueprint', async () => {
      //
      const { id: blueprintId } = await getBlueprintByMetadata(
        'title',
        blueprintA.metadata.title,
      )

      const recipient = Eve
      const signers = [Eve]

      await expect(mintNFT(blueprintId, recipient, signers)).rejects.toMatch(
        'Could not borrow a reference to the Admin.',
      )
      expect.assertions(1)
    })

    //
    it('shall not be able to batch mint NFTs', async () => {
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
    it('shall not be able to batch mint over specific max at once', async () => {
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
    it('shall return a blueprint for provided metadata', async () => {
      const { metadata } = blueprintA
      const blueprint = await getBlueprintByMetadata('title', metadata.title)

      expect(blueprint.metadata.title).toBe(metadata.title)
    })

    //
    it('shall return null for a bogus metadata', async () => {
      const blueprint = await getBlueprintByMetadata('title', 'bogus title')

      expect(blueprint).toBe(null)
    })
  })
})
