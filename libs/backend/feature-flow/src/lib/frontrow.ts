import * as t from '@onflow/types'
import { arg, Argument } from '@samatech/onflow-fcl-esm'
import { IFlowAccount, deploy, transact, execute } from '@samatech/onflow-ts'
import { IBlueprintMetadata } from '@ismedia/backend/type-blockchain'

export const metadataToArg = (metadata: IBlueprintMetadata): Argument => {
  return arg(
    [
      { key: 'artist', value: metadata.artist },
      { key: 'title', value: metadata.title },
      { key: 'id', value: metadata.id },
    ],
    t.Dictionary({ key: t.String, value: t.String }),
  )
}

/*
 * Deploys NonFungibleToken and FrontRow contracts to Admin.
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const deployFrontRow = async (admin: IFlowAccount) => {
  await deploy({
    name: 'NonFungibleToken',
    auth: admin,
  })

  return await deploy({
    name: 'FrontRow',
    auth: admin,
  })
}

/*
 * Sets up FrontRow collection on account and exposes public capability.
 * @param account - flow account
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const setupFrontRowCollectionOnAccount = (account: IFlowAccount) => {
  const name = 'frontrow/setup_account'

  return transact({
    name,
    signers: [account],
  })
}

/*
 * Destroys/clears a FrontRow collection on an account and removes the public capability
 * @param account - flow account
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const destroyFrontRowCollectionOnAccount = (account: IFlowAccount) => {
  const name = 'frontrow/destroy_account'

  return transact({
    name,
    signers: [account],
  })
}

/*
 * Checks if the given address has a FrontRow collection
 * @param address - account address
 * @returns {Promise<boolean>}
 */
export const hasFrontRowCollection = (address: string) => {
  const name = 'frontrow/has_frontrow_collection'
  const args = [arg(address, t.Address)]

  return execute(name, args)
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
  const name = 'frontrow/get_blueprint'
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
  signers: IFlowAccount[],
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
  recipient: string,
  signers: IFlowAccount[],
) => {
  const name = 'frontrow/mint_nft'
  const args = [arg(recipient, t.Address), arg(blueprintId, t.UInt32)]

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
  recipient: IFlowAccount,
  signers: IFlowAccount[],
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
export const cancelBlueprint = async (blueprintId: number, signers: IFlowAccount[]) => {
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
export const getCollectionIDs = (account: IFlowAccount) => {
  const name = 'frontrow/get_collection_ids'
  const args = [arg(account.address, t.Address)]

  return execute(name, args)
}

/*
 * Returns if the specified NFT is owned by the account
 * @param {string} account - account address
 * @param {UInt32} blueprintId - Blueprint id
 * @param {UInt32} serialNumber - NFT serialNumber within Blueprint
 * @throws Will throw an error if execution will be halted
 * @returns {boolean}
 * */
export const isNftOwner = (
  address: string,
  blueprintId: number,
  serialNumber: number,
) => {
  const name = 'frontrow/is_frontrow_nft_owner'
  const args = [
    arg(address, t.Address),
    arg(blueprintId, t.UInt32),
    arg(serialNumber, t.UInt32),
  ]

  return execute(name, args)
}

/*
 * Returns NFTs in the account collection.
 * @throws Will throw an error if execution will be halted
 * @returns [FrontRowNFT] - an array of NFTs in account collection
 * */
export const getCollectionNFTs = (account: IFlowAccount) => {
  const name = 'frontrow/get_collection_nfts'
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
export const getFrontRowNFT = async (account: IFlowAccount, id: number) => {
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
  account: IFlowAccount,
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
