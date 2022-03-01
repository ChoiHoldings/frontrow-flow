import { IFlowAccount, setupFusdOnAccount, mintFusdToAccount } from '@samatech/onflow-ts'
import {
  buyNFT,
  createNftListing,
  getBlueprintByMetadata,
  getCollectionIDs,
  getListings,
  printBlueprintCreateSaleOffer,
  setupFrontRowCollectionOnAccount,
} from '@ismedia/backend/feature-flow'
import { ISaleOfferFixture } from '@ismedia/backend/type-blockchain'

export interface IPrepareAdminAccountParams {
  admin: IFlowAccount
}

export interface IPrepareUserAccountParams {
  user: IFlowAccount
  admin: IFlowAccount
  fusdAmount: number
}

export interface IPreparePurchaseNftsParams {
  user: IFlowAccount
  admin: IFlowAccount
  saleOffer: ISaleOfferFixture
  quantity: number
}

export interface IPrepareListingFirstNftInCollectionParams {
  user: IFlowAccount
  price: number
}

/*
 * Prepare the Admin account to use in tests.
 * @param {IFlowAccount} admin - admin account
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const prepareAdminAccount = async (params: IPrepareAdminAccountParams) => {
  const { admin } = params
  await setupFusdOnAccount(admin)
  return await setupFrontRowCollectionOnAccount(admin)
}

/*
 * Prepare User account to use in tests.
 * Skips public collection and NftStorefront setup to enable more testing scenarios.
 * @param {IFlowAccount} account - user account
 * @param {IFlowAccount} admin - admin account to mint FUSD
 * @param {UInt64} fusdAmount - initial FUSD amount to add
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const prepareUserAccount = async (params: IPrepareUserAccountParams) => {
  const { user, admin, fusdAmount } = params
  await setupFusdOnAccount(user)
  return await mintFusdToAccount(admin, user, fusdAmount)
}

/*
 * Adds (purchases) NFTs
 * @param {IFlowAccount} user - user account
 * @param {IFlowAccount} admin - admin account to mint FUSD
 * @param {ISaleOfferFixture} saleOffer - information about NFT to purchase
 * @param {UInt32} quantity - number of NFTs to purchase
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const preparePurchaseNfts = async (params: IPreparePurchaseNftsParams) => {
  const { user, admin, saleOffer, quantity } = params
  const { price, blueprint } = saleOffer
  const { maxQuantity, metadata } = blueprint

  // Print a blueprint and create a sale offer
  await printBlueprintCreateSaleOffer(admin, maxQuantity, metadata, price)

  // Get printed blueprint with the actual ID
  const printedBlueprint = await getBlueprintByMetadata('title', metadata.title)

  // Purchase predefined number of NFTs
  for (let i = 0; i < quantity; i++) {
    await buyNFT(user, printedBlueprint.id)
  }
}

/*
 * Lists the first NFT in the collection for sale
 * @param {IFlowAccount} user - user account
 * @param {UInt64} price - the listing price
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const prepareListingFirstNftInCollection = async (
  params: IPrepareListingFirstNftInCollectionParams,
) => {
  const { user, price } = params

  // Prep information for the listing
  const collectionIDs = await getCollectionIDs(user)
  const nftId = collectionIDs[0]

  // Create a listing
  await createNftListing(user, nftId, price)

  const listings = await getListings(user)
  return listings[0]
}
