import { IListingAvailableEventData } from './i-listing-available-event-data'
import { IListingCompletedEventData } from './i-listing-completed-event-data'
import { IPurchaseEventData } from './i-purchase-event-data'

/**
 * This is a helper type to keep tests less verbose.
 * Only the 'type' property is required and all other properties are optional.
 */
export interface ICadenceEventByType {
  blockId?: string
  blockHeight?: number
  blockTimestamp?: string
  type: string
  transactionId?: string
  transactionIndex?: number
  eventIndex?: number
  data?:
    | Record<string, unknown>
    | IPurchaseEventData
    | IListingAvailableEventData
    | IListingCompletedEventData
}
