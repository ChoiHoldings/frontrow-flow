import { setContractAddress } from '@samatech/onflow-ts'
import { flowConfig } from './flow.config'
import { setFlowConfig } from './set-flow-config'

// FIX: Match usage in jobs app
export const setFlowConfigFromAppConfig = () => {
  setFlowConfig(flowConfig.get('flowAccessNode'))
  setContractAddress('FUSD', flowConfig.get('flowFusdAddress'))
  setContractAddress('FungibleToken', flowConfig.get('flowFungibleTokenAddress'))
  setContractAddress('NonFungibleToken', flowConfig.get('flowNonFungibleTokenAddress'))
  setContractAddress('FrontRow', flowConfig.get('flowFrontRowAddress'))
  setContractAddress(
    'FrontRowStorefront',
    flowConfig.get('flowFrontRowStorefrontAddress'),
  )
  setContractAddress('NFTStorefront', flowConfig.get('flowNftStorefrontAddress'))
}
