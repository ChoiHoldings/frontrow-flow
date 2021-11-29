import { CadenceEvent } from '@samatech/onflow-fcl-esm'

declare global {
  namespace jest {
    interface Matchers<R> {
      toEmit(expected: string | CadenceEvent | CadenceEvent[]): R
    }
  }
}
