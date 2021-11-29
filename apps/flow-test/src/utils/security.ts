import { arg } from '@samatech/onflow-fcl-esm'
import * as t from '@onflow/types'
import { FlowAccount } from '@ismedia/shared/util-flow'
import { transact } from '../lib/interactions'

/*
 * Try stealing **FrontRow.NFT** from another user collection
 * @param {UInt64} nftId - nft ID to steal
 * @param {string} recipient - recipient account address
 * @param [String] signers - account addresses
 * @throws Will throw an error if execution will be halted
 * @returns {Promise<*>}
 * */
export const stealNftFromCollection = async (
  nftId: number,
  recipient: FlowAccount,
  signers: FlowAccount[],
) => {
  const name = 'security/steal_nft_from_collection'
  const args = [arg(nftId, t.UInt64), arg(recipient.address, t.Address)]

  return transact({
    name,
    args,
    signers,
  })
}

/*
 * Try stealing **FrontRow.NFT** from a storefront
 * @param {UInt32} blueprintId - ID of the blueprint to steal
 * @param {string} thief - thief account address
 * @param [String] signers - account addresses
 * @throws Will throw an error if execution will be halted
 * @returns {Promise<*>}
 * */
export const stealNftFromStorefront = async (
  blueprintId: number,
  thief: FlowAccount,
  seller: FlowAccount,
) => {
  const name = 'security/steal_nft_from_storefront'
  const args = [arg(blueprintId, t.UInt32), arg(seller.address, t.Address)]
  const signers = [thief]

  return transact({
    name,
    args,
    signers,
  })
}
