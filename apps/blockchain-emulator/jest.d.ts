import { CadenceEvent } from '@samatech/onflow-fcl-esm'
import { ICadenceEventByType } from '@ismedia/shared-type-blockchain-event'
declare global {
  namespace jest {
    interface Matchers<R> {
      toEmit(
        expected:
          | string
          | CadenceEvent
          | CadenceEvent[]
          | ICadenceEventByType
          | ICadenceEventByType[],
      ): R
    }
  }
}
