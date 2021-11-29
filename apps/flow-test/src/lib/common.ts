import path from 'path'
import chalk from 'chalk'

import { config } from '@onflow/config'
import emulator from './emulator'
import { InteractionType } from './interactions'

export interface TestSetupOptions {
  port: number
  basePath: string
  cdcDirectories: {
    [InteractionType.SCRIPT]: string
    [InteractionType.TRANSACTION]: string
    [InteractionType.CONTRACT]: string
  }
}

export const logFilter = (message: string): string | undefined => {
  const match = message.match(/^.*(LOG:[\s\S]*?)\\".*$/s)
  if (match) {
    return `${chalk.green(match[1])}\n`
  }
  return undefined
}

export const testSetup = async ({ port, basePath, cdcDirectories }: TestSetupOptions) => {
  config().put('BASE_PATH', path.resolve(basePath))
  config().put('CDC_DIRECTORIES', cdcDirectories)
  config().put('accessNode.api', `http://localhost:${port}`)
  emulator.setLogFilter(logFilter)
  await emulator.start(port || 7001)
  return emulator
}

export const stopEmulator = () => {
  return emulator.stop()
}
