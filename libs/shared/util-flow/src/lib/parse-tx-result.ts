import { CadenceResult } from '@samatech/onflow-fcl-esm'
import { findEvent } from '@samatech/onflow-ts'

export const blueprintIdFromResult = (result: CadenceResult): number | undefined => {
  const eventType = 'FrontRow.BlueprintPrinted'
  const event = findEvent(result.events || [], eventType)
  return event?.data?.id as number | undefined
}

export const nftSerialNumberFromResult = (result: CadenceResult): number | undefined => {
  const eventType = 'FrontRow.Minted'
  const event = findEvent(result.events || [], eventType)
  return event?.data?.serialNumber as number | undefined
}
