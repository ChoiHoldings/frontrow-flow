import { arg } from '@samatech/onflow-fcl-esm'
import * as t from '@onflow/types'
import { FlowAccount, toUFix64 } from '@ismedia/shared/util-flow'
import { deployContract, execute, transact } from '../lib/interactions'

export const deployFusd = async (account: FlowAccount) => {
  await deployContract({ name: 'FUSD', auth: account })
}

export const setupFusdOnAccount = (account: FlowAccount) => {
  const name = 'fusd/setup_account'
  const signers = [account]
  return transact({
    name,
    signers,
  })
}

export const mintFusdToAccount = async (
  admin: FlowAccount,
  toAccount: FlowAccount,
  amount: number,
) => {
  const name = 'fusd/mint_tokens'
  const signers = [admin]
  const args = [arg(toAccount.address, t.Address), arg(toUFix64(amount), t.UFix64)]

  return transact({
    name,
    signers,
    args,
  })
}

export const getBalance = async (account: FlowAccount) => {
  const name = 'fusd/get_balance'
  const args = [arg(account.address, t.Address)]

  return execute(name, args)
}
