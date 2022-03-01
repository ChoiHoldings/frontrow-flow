import { emulator, logFilter } from '@samatech/onflow-ts'
import { setFlowConfig } from '@ismedia/backend/util-flow'

export const testSetup = async (port: number) => {
  setFlowConfig(`http://localhost:${port}`)
  emulator.setLogFilter(logFilter)
  await emulator.start(port || 7001)
  console.log(`Emulator started on port ${port}`)
  return emulator
}

export const stopEmulator = () => {
  return emulator.stop()
}
