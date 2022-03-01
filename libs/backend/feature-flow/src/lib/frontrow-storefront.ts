import * as t from '@onflow/types'
import { arg } from '@samatech/onflow-fcl-esm'
import {
  IFlowAccount,
  getContractAddress,
  toUFix64,
  deploy,
  execute,
  transact,
} from '@samatech/onflow-ts'
import { IBlueprintMetadata } from '@ismedia/backend/type-blockchain'
import { deployFrontRow, metadataToArg } from './frontrow'

/*
 * Deploys FrontRowStorefront contract to Admin.
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const deployFrontRowStorefront = async (admin: IFlowAccount) => {
  await deployFrontRow(admin)

  return await deploy({
    name: 'FrontRowStorefront',
    auth: admin,
  })
}

/*
 * Prints a Blueprint and creates a sale offer for it with a specified **price**.
 * @param {IFlowAccount} seller - seller account address
 * @param {UInt32} maxQuantity - maximum number of NFTs that can be minted for a blueprint
 * @param {String:String} metadata - blueprint metadata
 * @param {UFix64} price - price
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const printBlueprintCreateSaleOffer = async (
  seller: IFlowAccount,
  maxQuantity: number,
  metadata: IBlueprintMetadata,
  price: number,
) => {
  const name = 'frontrowStorefront/print_blueprint_create_sale_offer'
  const priceUfix64 = toUFix64(price / 100)
  const args = [
    arg(maxQuantity, t.UInt32),
    metadataToArg(metadata),
    arg(priceUfix64, t.UFix64),
  ]
  const signers = [seller]

  return transact({
    name,
    args,
    signers,
  })
}

/*
 * Creates sale offer for a Blueprint with a specified **price**.
 * @param {IFlowAccount} seller - seller account address
 * @param {UInt32} blueprintId - blueprint id (unique identifier for each sale offer)
 * @param {UFix64} price - price
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const createSaleOffer = async (
  seller: IFlowAccount,
  blueprintId: number,
  price: number,
) => {
  const name = 'frontrowStorefront/create_sale_offer'
  const priceUfix64 = toUFix64(price / 100)
  const args = [arg(blueprintId, t.UInt32), arg(priceUfix64, t.UFix64)]
  const signers = [seller]

  return transact({
    name,
    args,
    signers,
  })
}

/*
 * Removes a sale offer.
 * @param {IFlowAccount} seller - seller account address
 * @param {UInt32} blueprintId - blueprint id to remove (uniquely identifies a sale offer)
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const removeSaleOffer = async (seller: IFlowAccount, blueprintId: number) => {
  const name = 'frontrowStorefront/remove_sale_offer'
  const args = [arg(blueprintId, t.UInt32)]
  const signers = [seller]

  return transact({
    name,
    args,
    signers,
  })
}

/*
 * Buys an NFT via a blueprint sale offer for a give **price** from **seller**.
 * @param {IFlowAccount} buyer - buyer account address
 * @param {UInt32} blueprintId - blueprint to purchase
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const buyNFT = async (buyer: IFlowAccount, blueprintId: number) => {
  const name = 'frontrowStorefront/buy_nft'
  const storefrontAddress = getContractAddress('FrontRowStorefront')
  const args = [arg(blueprintId, t.UInt32), arg(storefrontAddress, t.Address)]
  const signers = [buyer]

  return transact({
    name,
    args,
    signers,
  })
}

/*
 * Returns sale offer details.
 * @param {IFlowAccount} seller - seller account address
 * @param {UInt32} blueprintId - blueprint id
 * @throws Will throw an error if execution will be halted
 * @returns {SaleOfferDetails} - sale offer details
 * */
export const getSaleOfferDetails = (seller: IFlowAccount, blueprintId: number) => {
  const name = 'frontrowStorefront/get_sale_offer_details'
  const args = [arg(seller.address, t.Address), arg(blueprintId, t.UInt32)]

  return execute(name, args)
}

/*
 * Returns the total number of sale offers in the storefront.
 * @param {IFlowAccount} account - account address
 * @throws Will throw an error if execution will be halted
 * @returns {UInt32}
 * */
export const getSaleOffersCount = async (account: IFlowAccount) => {
  const name = 'frontrowStorefront/get_sale_offers_count'
  const args = [arg(account.address, t.Address)]

  return execute(name, args)
}

/*
 * Returns the number of NFTs for sale in a given account's storefront.
 * @param {IFlowAccount} account - account address
 * @throws Will throw an error if execution will be halted
 * @returns {UInt32}
 * */
export const getSaleOffers = async (account: IFlowAccount) => {
  const name = 'frontrowStorefront/get_sale_offers'
  const args = [arg(account.address, t.Address)]

  return execute(name, args)
}
