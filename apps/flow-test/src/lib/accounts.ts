import { ec as EC } from 'elliptic'
import * as rlp from 'rlp'
import * as t from '@onflow/types'
import { flowConfig } from '@onflow/fcl-config'
import { arg } from '@samatech/onflow-fcl-esm'
import { flowConfigGet, sendTransaction } from '@ismedia/shared/data-access-flow'
import { withPrefix } from '@ismedia/shared/util-flow'
import { AnyJson } from '@ismedia/shared/util-core'
import { authorization } from '@ismedia/shared/util-flow-crypto'
import { FlowAccount } from '@ismedia/shared/util-flow'

const flowConfigObj: AnyJson = flowConfig()

const ec = new EC('p256')

export const CODE = `
transaction (_ pubKey: String) {
    prepare( admin: AuthAccount) {
        let newAccount = AuthAccount(payer:admin)
        newAccount.addPublicKey(pubKey.decodeHex())
    }
}
`

export const formatPubKey = (pubKey: string): string => {
  return rlp
    .encode([
      Buffer.from(pubKey, 'hex'), // publicKey hex to binary
      2, // P256 per https://github.com/onflow/flow/blob/master/docs/accounts-and-keys.md#supported-signature--hash-algorithms
      3, // SHA3-256 per https://github.com/onflow/flow/blob/master/docs/accounts-and-keys.md#supported-signature--hash-algorithms
      1000, // give key full weight
    ])
    .toString('hex')
}

// Currently unused, we create accounts offline and use public keys from flow.json
export const pubFlowKey = async (privateKey: string): Promise<string> => {
  const keys = ec.keyFromPrivate(Buffer.from(privateKey), 'hex')
  const publicKey = keys.getPublic('hex').replace(/^04/, '')
  return formatPubKey(publicKey)
}

export class AccountManager {
  rootAddress: string
  rootPrivateKey: string
  accounts: Record<string, FlowAccount> = {}

  register(path: string): FlowAccount {
    const address = withPrefix(flowConfigGet(flowConfigObj, `${path}/address`))
    const privateKey = flowConfigGet(flowConfigObj, `${path}/key`)
    if (!address || !privateKey) {
      throw new Error(`No address/key found in ${path}`)
    }
    this.accounts[address] = {
      address,
      privateKey,
    }
    return this.accounts[address]
  }
  async create(auth: FlowAccount, path: string): Promise<FlowAccount> {
    const address = withPrefix(flowConfigGet(flowConfigObj, `${path}/address`))
    const privateKey = flowConfigGet(flowConfigObj, `${path}/key`)
    const publicKey = flowConfigGet(flowConfigObj, `${path}/pubKey`)
    if (!address || !privateKey || !publicKey) {
      throw new Error(`No address/key/pubKey found in ${path}`)
    }

    const args = [arg(formatPubKey(publicKey), t.String)]
    await sendTransaction({
      code: CODE,
      args,
      auth: authorization(auth),
    })
    this.accounts[address] = {
      address,
      privateKey,
    }
    return this.accounts[address]
  }

  get(address: string): FlowAccount {
    const account = this.accounts[address]
    if (!account) {
      throw new Error(`No account found for ${address}`)
    }
    return account
  }
}
