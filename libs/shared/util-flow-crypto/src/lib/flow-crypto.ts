import { Buffer } from 'buffer'
import { ec as EC } from 'elliptic'
import { SHA3 } from 'sha3'
import {
  Account,
  AuthZ,
  FclAuthorization,
  sansPrefix,
  TransactionData,
  TransactionSignature,
} from '@samatech/onflow-fcl-esm'
import { withPrefix, FlowAccount } from '@ismedia/shared/util-flow'

const ec = new EC('p256')

const hashMsgHex = (msgHex: string) => {
  const sha = new SHA3(256)
  sha.update(Buffer.from(msgHex, 'hex'))
  return sha.digest()
}

const signWithKey = (privateKey: string, msgHex: string) => {
  const key = ec.keyFromPrivate(Buffer.from(privateKey, 'hex'))
  const sig = key.sign(hashMsgHex(msgHex))
  const n = 32 // half of signature length?
  const r = sig.r.toArrayLike(Buffer, 'be', n)
  const s = sig.s.toArrayLike(Buffer, 'be', n)
  return Buffer.concat([r, s]).toString('hex')
}

export const authorizationMaybe = (
  FlowAccount?: FlowAccount,
): FclAuthorization | undefined => {
  if (FlowAccount) {
    return authorization(FlowAccount)
  }
  return undefined
}

export const authorization =
  (FlowAccount: FlowAccount): FclAuthorization =>
  async (account: Account): Promise<AuthZ> => {
    const keyId = FlowAccount.keyId ?? 0

    const addr = sansPrefix(FlowAccount.address)

    const signingFunction = (data: TransactionData): TransactionSignature => {
      return {
        keyId,
        addr: withPrefix(addr) ?? '',
        signature: signWithKey(FlowAccount.privateKey, data.message),
      }
    }

    return {
      ...account,
      tempId: `${addr}-${keyId}`,
      addr: sansPrefix(addr),
      keyId,
      signingFunction,
    }
  }
