import { arg, Argument } from '@samatech/onflow-fcl-esm'
import * as t from '@onflow/types'
import { FlowAccount, toUFix64 } from '@ismedia/shared/util-flow'
import { deployContract, transact, execute } from '../lib/interactions'
import { mintFlow } from '../lib/flow'

export interface IBlueprintMetadata {
  artist: string
  title: string
}

export interface IBlueprintFixture {
  id?: number
  maxQuantity: number
  metadata: IBlueprintMetadata
}

// Blueprints
export const blueprintA: IBlueprintFixture = {
  maxQuantity: 1,
  metadata: {
    artist: 'BTS',
    title: 'Permission to Dance',
  },
}
export const blueprintB: IBlueprintFixture = {
  maxQuantity: 2,
  metadata: {
    artist: 'Exo',
    title: 'Obsession',
  },
}

export const blueprintC: IBlueprintFixture = {
  maxQuantity: 5,
  metadata: {
    artist: 'BLACKPINK',
    title: 'How You Like That',
  },
}

export const blueprintD: IBlueprintFixture = {
  maxQuantity: 3,
  metadata: {
    artist: 'ITZY',
    title: 'WANNABE',
  },
}

export const blueprintE: IBlueprintFixture = {
  maxQuantity: 2,
  metadata: {
    artist: 'UI',
    title: 'Celebrity',
  },
}

export const blueprintF: IBlueprintFixture = {
  maxQuantity: 5,
  metadata: {
    artist: 'BTS',
    title: 'Butter',
  },
}

export const blueprintX: IBlueprintFixture = {
  maxQuantity: 300,
  metadata: {
    artist: 'iKON',
    title: 'LOVE SCENARIO',
  },
}

const metadataToArg = (metadata: IBlueprintMetadata): Argument => {
  return arg(
    [
      { key: 'artist', value: metadata.artist },
      { key: 'title', value: metadata.title },
    ],
    t.Dictionary({ key: t.String, value: t.String }),
  )
}

/*
 * Deploys NonFungibleToken and FrontRow contracts to Admin.
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const deployFrontRow = async (admin: FlowAccount) => {
  await mintFlow(admin, admin, toUFix64(10.0))

  await deployContract({
    name: 'NonFungibleToken',
    auth: admin,
  })

  return await deployContract({
    name: 'FrontRow',
    auth: admin,
  })
}

/*
 * Setups FrontRow collection on account and exposes public capability.
 * @param {string} account - account address
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const setupFrontRowCollectionOnAccount = (account: FlowAccount) => {
  const name = 'frontrow/setup_account'

  return transact({
    name,
    signers: [account],
  })
}

/*
 * Returns the total supply of minted NFTs.
 * @throws Will throw an error if execution will be halted
 * @returns {UInt64} - number of NFT minted so far
 * */
export const getTotalSupply = () => {
  const name = 'frontrow/get_total_supply'

  return execute(name)
}

/*
 * Returns the total blueprints count.
 * @throws Will throw an error if execution will be halted
 * @returns {UInt32} - number of Blueprints printed so far
 * */
export const getBlueprintsCount = async () => {
  const name = 'frontrow/get_blueprints_count'

  const result = await execute(name)
  return result as number
}

/*
 * Returns all **Blueprints**.
 * @throws Will throw an error if execution will be halted
 * @returns {UInt32:FrontRow.Blueprint} - set of Blueprints printed so far
 * */
export const getBlueprints = () => {
  const name = 'frontrow/get_blueprints'

  return execute(name)
}

/*
 * Returns a **Blueprint**.
 * @throws Will throw an error if execution will be halted
 * @returns {FrontRow.Blueprint}
 * */
export const getBlueprint = (blueprintId: number) => {
  const name = 'frontrow/get_blueprints'
  const args = [arg(blueprintId, t.UInt32)]

  return execute(name, args)
}

/*
 * Returns a **Blueprint**.
 * @throws Will throw an error if execution will be halted
 * @returns {FrontRow.Blueprint}
 * */
export const getBlueprintByMetadata = (metadataField: string, metadataValue: string) => {
  const name = 'frontrow/get_blueprint_by_metadata'
  const args = [arg(metadataField, t.String), arg(metadataValue, t.String)]

  return execute(name, args)
}

/*
 * Returns the total number of NFTs minted for a blueprint.
 * @param {UInt32} BlueprintID - blueprint id
 * @throws Will throw an error if execution will be halted
 * @returns {UInt32} - number of NFTs minted
 * */
export const getMintCountPerBlueprint = (blueprintId: number) => {
  const name = 'frontrow/get_total_nfts_minted_for_blueprint'
  const args = [arg(blueprintId, t.UInt32)]

  return execute(name, args)
}

/*
 * Prints (or creates) a new **Blueprint**.
 * @param {UInt32} maxQuantity - maximum number of NFTs that can be minted for a blueprint
 * @param {String:String} metadata - blueprint metadata
 * @param [String] signers - account addresses
 * @throws Will throw an error if execution will be halted
 * @returns {Promise<*>}
 * */
export const printBlueprint = async (
  maxQuantity: number,
  metadata: IBlueprintMetadata,
  signers: FlowAccount[],
) => {
  const name = 'frontrow/print_blueprint'
  const args = [arg(maxQuantity, t.UInt32), metadataToArg(metadata)]

  return transact({
    name,
    signers,
    args,
  })
}

/*
 * Mints **FrontRow.NFT** of a specific **Blueprint** and sends it to **recipient**.
 * @param {UInt32} blueprintId - blueprint to mint
 * @param {string} recipient - recipient account address
 * @param [String] signers - account addresses
 * @throws Will throw an error if execution will be halted
 * @returns {Promise<*>}
 * */
export const mintNFT = async (
  blueprintId: number,
  recipient: FlowAccount,
  signers: FlowAccount[],
) => {
  const name = 'frontrow/mint_nft'
  const args = [arg(recipient.address, t.Address), arg(blueprintId, t.UInt32)]

  return transact({
    name,
    args,
    signers,
  })
}

/*
 * Mints arbitrary number of FrontRow NFTs of a specific.
 * **Blueprint** and sends it to **recipient**.
 * @param {UInt32} blueprintId - blueprint to mint
 * @param {UInt64} quantity - number of NFTs to mint
 * @param {string} recipient - recipient account address
 * @param [String] signers - account addresses
 * @throws Will throw an error if execution will be halted
 * @returns {Promise<*>}
 * */
export const batchMintNFT = async (
  blueprintId: number,
  quantity: number,
  recipient: FlowAccount,
  signers: FlowAccount[],
) => {
  const name = 'frontrow/batch_mint_nft'
  const args = [
    arg(recipient.address, t.Address),
    arg(blueprintId, t.UInt32),
    arg(quantity, t.UInt64),
  ]

  return transact({
    name,
    args,
    signers,
  })
}

/*
 * Cancels a **Blueprint** so no new NFTs can be minted from it.
 * This process is irreversible
 * @param {UInt32} blueprintId - blueprint to cancel
 * @param [String] signers - account addresses
 * @throws Will throw an error if execution will be halted
 * @returns {Promise<*>}
 * */
export const cancelBlueprint = async (blueprintId: number, signers: FlowAccount[]) => {
  const name = 'frontrow/cancel_blueprint'
  const args = [arg(blueprintId, t.UInt32)]

  return transact({
    name,
    args,
    signers,
  })
}

/*
 * Returns NFT IDs in the account collection.
 * @throws Will throw an error if execution will be halted
 * @returns [UInt64] - an array of NFT IDs in account collection
 * */
export const getCollectionIDs = (account: FlowAccount) => {
  const name = 'frontrow/get_collection_ids'
  const args = [arg(account.address, t.Address)]

  return execute(name, args)
}

/*
 * Returns the specific **FrontRow.NFT** from an account collection based on a global id.
 * @param {string} account - account address
 * @param {UInt64} id - global NFT id
 * @throws Will throw an error if execution will be halted
 * @returns {FrontRow.NFT}
 * */
export const getFrontRowNFT = async (account: FlowAccount, id: number) => {
  const name = 'frontrow/get_frontrow_nft'
  const args = [arg(account.address, t.Address), arg(id, t.UInt64)]

  return execute(name, args)
}

/*
 * Returns the specific **FrontRow.NFT** for a given serial number and a blueprint.
 * @param {string} account - account address
 * @param {UInt32} blueprintId - Blueprint id
 * @param {UInt32} serialNumber - NFT serialNumber within Blueprint
 * @throws Will throw an error if execution will be halted
 * @returns {FrontRow.NFT}
 * */
export const getFrontRowNFTByBlueprint = async (
  account: FlowAccount,
  blueprintId: number,
  serialNumber: number,
) => {
  const name = 'frontrow/get_frontrow_nft_by_blueprint'
  const args = [
    arg(account.address, t.Address),
    arg(blueprintId, t.UInt32),
    arg(serialNumber, t.UInt32),
  ]

  return execute(name, args)
}
