import { IFlowAccount } from '@samatech/onflow-ts'
import { flowConfig } from './flow.config'

export const getFlowAdminAccount = (): IFlowAccount => {
  return {
    address: flowConfig.get('flowAdminAddress'),
    privateKey: flowConfig.get('flowAdminPrivateKey'),
  }
}
