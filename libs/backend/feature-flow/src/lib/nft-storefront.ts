import { arg } from '@samatech/onflow-fcl-esm'
import * as t from '@onflow/types'
import { IFlowAccount, toUFix64, deploy, execute, transact } from '@samatech/onflow-ts'
import { deployFrontRowStorefront } from './frontrow-storefront'

/*
 * Deploys NFTStorefront contracts to Admin.
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const deployNftStorefront = async (admin: IFlowAccount) => {
  await deployFrontRowStorefront(admin)

  return await deploy({ name: 'NFTStorefront', auth: admin })
}

/*
 * Sets up NFTStorefront.Storefront on account and exposes public capability.
 * @param {IFlowAccount} account - account address
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const setupNftStorefrontOnAccount = (account: IFlowAccount) => {
  const name = 'nftStorefront/setup_account'

  return transact({ name, signers: [account] })
}

/*
 * Lists item with id equal to **item** id for sale with specified **price**.
 * @param {IFlowAccount} seller - seller account address
 * @param {UInt64} id of the NFT to list for sale
 * @param {UFix64} price - price
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const createNftListing = async (
  seller: IFlowAccount,
  nftId: number,
  price: number,
) => {
  const name = 'nftStorefront/create_listing'
  const args = [arg(nftId, t.UInt64), arg(toUFix64(price), t.UFix64)]
  const signers = [seller]

  return transact({ name, args, signers })
}

/*
 * Buys item with id equal to **item** id for **price** from **seller**.
 * @param {IFlowAccount} buyer - buyer account address
 * @param {UInt64} resourceId - resource uuid of item to sell
 * @param {IFlowAccount} seller - seller account address
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const purchaseNftListing = async (
  buyer: IFlowAccount,
  resourceId: number,
  seller: IFlowAccount,
) => {
  const name = 'nftStorefront/purchase_listing'
  const args = [arg(resourceId, t.UInt64), arg(seller.address, t.Address)]
  const signers = [buyer]

  return transact({ name, args, signers })
}

/*
 * Removes item with id equal to **item** from sale.
 * @param {IFlowAccount} owner - owner address
 * @param {UInt64} nftId - id of the NFT to remove from sale
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const removeNftListing = async (owner: IFlowAccount, nftId: number) => {
  const name = 'nftStorefront/remove_listing'
  const signers = [owner]
  const args = [arg(nftId, t.UInt64)]

  return transact({ name, args, signers })
}

/*
 * Returns the listing for the given resource id
 * @param {IFlowAccount} account - account address
 * @throws Will throw an error if execution will be halted
 * @returns {UInt64}
 * */
export const getListing = async (account: IFlowAccount, listingId: number) => {
  const name = 'nftStorefront/get_listing'
  const args = [arg(account.address, t.Address), arg(listingId, t.UInt64)]

  return execute(name, args)
}

/*
 * Returns the listing NFT information for the given resource id
 * @param {t.Address} address - storefront address
 * @throws Will throw an error if execution will be halted
 * @returns {UInt64}
 * */
export const getListingNft = async (address: t.Address, listingId: number) => {
  const name = 'nftStorefront/get_listing_nft'
  const args = [arg(address, t.Address), arg(listingId, t.UInt64)]

  return execute(name, args)
}

/*
 * Returns the number of items for sale in a given account's storefront.
 * @param {IFlowAccount} account - account address
 * @throws Will throw an error if execution will be halted
 * @returns {UInt64}
 * */
export const getListingCount = async (account: IFlowAccount) => {
  const name = 'nftStorefront/get_listings_length'
  const args = [arg(account.address, t.Address)]

  return execute(name, args)
}

/*
 * Returns the number of items for sale in a given account's storefront.
 * @param {IFlowAccount} account - account address
 * @throws Will throw an error if execution will be halted
 * @returns {UInt64}
 * */
export const getListings = async (account: IFlowAccount) => {
  const name = 'nftStorefront/get_listings'
  const args = [arg(account.address, t.Address)]

  return execute(name, args)
}

/*
 * Returns account's storefront id.
 * @param {IFlowAccount} account - account address
 * @throws Will throw an error if execution will be halted
 * @returns UInt64
 * */
export const getStorefrontId = async (account: IFlowAccount) => {
  const name = 'nftStorefront/get_storefront_id'
  const args = [arg(account.address, t.Address)]

  return execute(name, args)
}
