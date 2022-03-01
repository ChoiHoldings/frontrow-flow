import path from 'path'
import { config } from '@onflow/config'
import { InteractionType } from '@samatech/onflow-ts'

export const setFlowConfig = (accessNode: string) => {
  const basePath = './libs/shared/data-access-flow/src/lib/frontrow'
  const cdcDirectories = {
    [InteractionType.CONTRACT]: './contracts/',
    [InteractionType.TRANSACTION]: './transactions/',
    [InteractionType.SCRIPT]: './scripts/',
  }
  config().put('BASE_PATH', path.resolve(basePath))
  config().put('CDC_DIRECTORIES', cdcDirectories)
  config().put('accessNode.api', accessNode)
}
