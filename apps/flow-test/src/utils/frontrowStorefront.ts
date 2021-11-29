import { arg } from '@samatech/onflow-fcl-esm'
import * as t from '@onflow/types'

import { deployFusd, setupFusdOnAccount } from './fusd'
import { deployContract, execute, transact } from '../lib/interactions'
import { FlowAccount } from '@ismedia/shared/util-flow'
import { blueprintA, blueprintB, blueprintC, deployFrontRow } from './frontrow'
import { getContractAddress } from '@ismedia/shared/data-access-flow'

// Sale offers
export const saleOfferA = {
  price: 1.0,
  blueprintId: blueprintA.id,
}
export const saleOfferB = {
  price: 2.5,
  blueprintId: blueprintB.id,
}
export const saleOfferC = {
  price: 5.55,
  blueprintId: blueprintC.id,
}

/*
 * Deploys FrontRowStorefront contract to Admin.
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const deployFrontRowStorefront = async (admin: FlowAccount) => {
  await deployFrontRow(admin)
  await deployFusd(admin)
  await setupFusdOnAccount(admin)

  return await deployContract({
    name: 'FrontRowStorefront',
    auth: admin,
  })
}

/*
 * Creates sale offer for a Blueprint with a specified **price**.
 * @param {FlowAccount} seller - seller account address
 * @param {UInt32} blueprintId - blueprint id (unique identifier for each sale offer)
 * @param {UFix64} price - price
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const createSaleOffer = async (
  seller: FlowAccount,
  blueprintId: number,
  price: string,
) => {
  const name = 'frontrowStorefront/create_sale_offer'
  const args = [arg(blueprintId, t.UInt32), arg(price, t.UFix64)]
  const signers = [seller]

  return transact({
    name,
    args,
    signers,
  })
}

/*
 * Removes a sale offer.
 * @param {FlowAccount} seller - seller account address
 * @param {UInt32} blueprintId - blueprint id to remove (uniquely identifies a sale offer)
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const removeSaleOffer = async (seller: FlowAccount, blueprintId: number) => {
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
 * @param {FlowAccount} buyer - buyer account address
 * @param {UInt32} blueprintId - blueprint to purchase
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const buyNFT = async (buyer: FlowAccount, blueprintId: number) => {
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
 * @param {FlowAccount} seller - seller account address
 * @param {UInt32} blueprintId - blueprint id
 * @throws Will throw an error if execution will be halted
 * @returns {SaleOfferDetails} - sale offer details
 * */
export const getSaleOfferDetails = (seller: FlowAccount, blueprintId: number) => {
  const name = 'frontrowStorefront/get_sale_offer_details'
  const args = [arg(seller.address, t.Address), arg(blueprintId, t.UInt32)]

  return execute(name, args)
}

/*
 * Returns the total number of sale offers in the storefront.
 * @param {FlowAccount} account - account address
 * @throws Will throw an error if execution will be halted
 * @returns {UInt32}
 * */
export const getSaleOffersCount = async (account: FlowAccount) => {
  const name = 'frontrowStorefront/get_sale_offers_count'
  const args = [arg(account.address, t.Address)]

  return execute(name, args)
}

/*
 * Returns the number of NFTs for sale in a given account's storefront.
 * @param {FlowAccount} account - account address
 * @throws Will throw an error if execution will be halted
 * @returns {UInt32}
 * */
export const getSaleOffers = async (account: FlowAccount) => {
  const name = 'frontrowStorefront/get_sale_offers'
  const args = [arg(account.address, t.Address)]

  return execute(name, args)
}
