import fs from 'fs'
import path from 'path'
import * as fcl from '@samatech/onflow-fcl-esm'
import * as t from '@onflow/types'
import { config } from '@onflow/config'
import {
  executeScript,
  getAddressMap,
  getTemplate,
  sendTransaction,
  setContractAddress,
  ContractMap,
} from '@ismedia/shared/data-access-flow'
import { authorization, authorizationMaybe } from '@ismedia/shared/util-flow-crypto'
import { withPrefix, FlowAccount } from '@ismedia/shared/util-flow'

export enum InteractionType {
  CONTRACT = 'CONTRACT',
  TRANSACTION = 'TRANSACTION',
  SCRIPT = 'SCRIPT',
}

export interface Interaction {
  name: string
  addressMap?: ContractMap
  type: InteractionType.CONTRACT | InteractionType.TRANSACTION | InteractionType.SCRIPT
}

export interface TransactProps {
  name: string
  auth?: FlowAccount
  signers?: FlowAccount[]
  args?: fcl.Argument[]
}

export const readFile = (path: string) => {
  return fs.readFileSync(path, 'utf8')
}

export const getPath = async (name: string, type: InteractionType) => {
  const configBase = await config().get('BASE_PATH')
  const cdcDirectories = await config().get('CDC_DIRECTORIES')
  if (!configBase || !cdcDirectories) {
    throw new ReferenceError('BASE_PATH or CDC_DIRECTORIES not set.')
  }
  // Set directory where Cadence files of certain type are residing
  // e.g TRANSACTION: './transactions/' => directory = './transactions/'
  const directory = cdcDirectories[type]
  return path.resolve(configBase, `${directory}/${name}.cdc`)
}

/**
 * Returns a Cadence code template based on the name and the interaction type.
 * For example, for the give name = 'get_count' and type = 'SCRIPT' this function will
 * search for the `get_count.cdc` file located in the folder where all Cadence scripts are
 * residing.
 * @param name - name of the template in the corresponding interaction type folder.
 * @param type - type of interaction. It can be either CONTRACT, TRANSACTION or SCRIPT.
 * @returns {Promise<string>}
 */
const getCadenceCode = async ({ name, type }: Interaction): Promise<string> => {
  const path = await getPath(name, type)
  const addressMap = getAddressMap()
  return getTemplate(readFile(path), addressMap)
}

export const transact = async (props: TransactProps): Promise<fcl.CadenceResult> => {
  const { name, auth, signers, args } = props

  let resolvedSigners
  if (signers) {
    resolvedSigners = signers
  } else if (auth) {
    resolvedSigners = [auth]
  } else {
    throw new Error('transact missing authorization')
  }

  const code = await getCadenceCode({
    name,
    type: InteractionType.TRANSACTION,
  })

  return sendTransaction({
    code,
    args,
    auth: authorizationMaybe(auth),
    authorizations: resolvedSigners.map((signer) => authorization(signer)),
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const execute = async (name: string, args?: fcl.Argument[]): Promise<any> => {
  const code = await getCadenceCode({
    name,
    type: InteractionType.SCRIPT,
  })
  return executeScript({ args, code })
}

export interface DeployProps {
  auth: FlowAccount
  name: string
  to?: string
  args?: fcl.Argument[]
  update?: boolean
}

/**
 * Deploys contract as Cadence code to specified account
 * Returns transaction result.
 * @param props - Deploy properties
 */
export const deployContract = async (props: DeployProps) => {
  const { auth, name, args, update, to } = props

  const resolvedTo = withPrefix(to ?? auth.address)
  if (!resolvedTo) {
    throw new Error('Unable to resolve contract deploy address')
  }
  const resolvedCode = await getCadenceCode({
    name,
    type: InteractionType.CONTRACT,
  })

  const hexedCode = hexContract(resolvedCode)

  let code = update ? UPDATE_CODE : DEPLOY_CODE

  let deployArgs: fcl.Argument[] = [fcl.arg(name, t.String), fcl.arg(hexedCode, t.String)]

  // We don't really care about the names of the arguments, but we need unique one for each one of them
  const argLetter = 'abcdefghijklmnopqrstuvwxyz'
  if (args) {
    deployArgs = deployArgs.concat(args)

    const argsList: string[] = []
    const argsWithTypes: string[] = []
    let i = 0
    for (const a of args) {
      const argName = argLetter[i]
      argsList.push(argName)

      const argWithName = `${argName}:${a.xform.label}`
      i += 1
      argsList.push(argWithName)
    }

    code = code.replace('##ARGS-WITH-TYPES##', `, ${argsWithTypes}`)
    code = code.replace('##ARGS-LIST##', argsList.toString())
  } else {
    code = code.replace('##ARGS-WITH-TYPES##', ``)
    code = code.replace('##ARGS-LIST##', '')
  }

  const result = await sendTransaction({
    code,
    args: deployArgs,
    auth: authorization(auth),
  })
  setContractAddress(name, resolvedTo)
  return result
}

export const hexContract = (contract: string) =>
  Buffer.from(contract, 'utf8').toString('hex')

const UPDATE_CODE = `

transaction(name:String, code: String ##ARGS-WITH-TYPES##) {
  prepare(acct: AuthAccount){
      let decoded = code.decodeHex()

      if acct.contracts.get(name: name) == nil {
        acct.contracts.add(name: name, code: decoded)
      } else {
        acct.contracts.update__experimental(name: name, code: decoded)
      }
  }
}

`

const DEPLOY_CODE = `

transaction(name:String, code: String, ##ARGS-WITH-TYPES##) {
  prepare(acct: AuthAccount){
      let decoded = code.decodeHex()
      acct.contracts.add(
         name: name,
         code: decoded,
         ##ARGS-LIST##
      )
  }
}
`
