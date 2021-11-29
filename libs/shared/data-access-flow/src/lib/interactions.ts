import * as fcl from '@samatech/onflow-fcl-esm'
import { ContractMap, extractImports, getTemplate } from './flow-util'

/**
 * Address map with access by name for contracts deployed by default.
 * Pre-filled values are emulator contract addresses
 */
export const defaultsByName: ContractMap = {
  FlowToken: '0x0ae53cb6e3f42a79',
  FungibleToken: '0xee82856bf20e2aa6',
  FlowFees: '0xe5a8b7f23e8b548f',
  FlowStorageFees: '0xf8d6e0586b0a20c7',
}

const contractsMap: ContractMap = {}

export interface InteractionProps {
  name?: string
  code: string
  args?: fcl.Argument[]
  auth?: fcl.FclAuthorization
  authorizations?: fcl.FclAuthorization[]
}

export interface ResolvedInteractionProps {
  name: string
  auth?: fcl.FclAuthorization
  authorizations?: fcl.FclAuthorization[]
  args?: fcl.Argument[]
  code: string
}

export const setContractAddress = (name: string, address: string): void => {
  contractsMap[name] = address
}

export const getAddressMap = (): ContractMap => {
  return {
    ...defaultsByName,
    ...contractsMap,
  }
}

export const getContractAddress = (key: string): string | undefined => {
  return getAddressMap()[key]
}

/**
 * Resolves import addresses defined in code template
 * @param {string} code - Cadence template code.
 */
export const resolveImports = async (code: string) => {
  const addressMap: ContractMap = {}
  const importList = extractImports(code)
  for (const key in importList) {
    const address = getContractAddress(key)
    if (address) {
      addressMap[key] = address
    } else {
      console.error('resolveImports - could not find contract address', key)
    }
  }
  return addressMap
}

/**
 * Returns Cadence template code with replaced import addresses
 * @param {string} code - Cadence template code.
 * @returns {*}
 */
export const replaceImportAddresses = async (code: string): Promise<string> => {
  const deployedContracts = await resolveImports(code)

  const addressMap = {
    ...defaultsByName,
    ...deployedContracts,
  }
  return getTemplate(code, addressMap)
}

/**
 * Submits transaction to emulator network and waits before it will be sealed.
 * Returns transaction result.
 * @param {string} [props.name] - Name of Cadence template file
 * @param {{string:string}} [props.addressMap={}] - name/address map to use as lookup table for addresses in import statements.
 * @param {string} [props.code] - Cadence code of the transaction.
 * @param {[any]} props.args - array of arguments specified as tupple, where last value is the type of preceding values.
 * @param {[string]} [props.signers] - list of signers, who will authorize transaction, specified as array of addresses.
 */
export const sendTransaction = async (
  props: InteractionProps,
): Promise<fcl.CadenceResult> => {
  const { name, code, args, authorizations, auth } = props

  if (!name && !code) {
    throw Error('Both `name` and `code` are missing. Provide either of them')
  }

  const ixCode = await replaceImportAddresses(code)

  const payer = auth ?? (authorizations ?? [])[0]

  if (!payer) {
    throw new Error('sendTransaction requires at least one authorization')
  }

  // set repeating transaction code
  const ix = [
    fcl.transaction(ixCode),
    fcl.payer(payer),
    fcl.proposer(payer),
    fcl.limit(9999),
  ]

  if (authorizations) {
    ix.push(fcl.authorizations(authorizations))
  } else {
    ix.push(fcl.authorizations([payer]))
  }
  // add arguments if any
  if (args) {
    ix.push(fcl.args(args))
  }
  const response = await fcl.send(ix)
  return await fcl.tx(response).onceExecuted()
}

export const executeScript = async (
  props: InteractionProps,
): Promise<fcl.CadenceResult> => {
  const { code, args } = props

  if (!code) {
    throw Error('executeScript `code` is missing.')
  }
  const ixCode = await replaceImportAddresses(code)

  const ix: [unknown] = [fcl.script(ixCode)]
  // add arguments if any
  if (args) {
    ix.push(fcl.args(args))
  }
  const response = await fcl.send(ix)
  return fcl.decode(response)
}
