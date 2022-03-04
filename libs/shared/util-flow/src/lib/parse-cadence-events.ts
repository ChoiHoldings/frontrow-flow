import { CadenceEvent } from '@samatech/onflow-fcl-esm'
import { findEvent } from '@samatech/onflow-ts'
import { IPurchaseEventData } from '@ismedia/shared/type-blockchain-event'
import { IListingCompletedEventData } from '@ismedia/shared/type-blockchain-event'

export const getBlueprintPurchaseEventData = (
  events?: CadenceEvent[],
): IPurchaseEventData | undefined => {
  const eventType = 'FrontRowStorefront.Purchase'
  const event: CadenceEvent | undefined = findEvent(events ?? [], eventType)

  const { blueprintId, serialNumber, soldOut } = event?.data || {}
  if (blueprintId === undefined || serialNumber === undefined || soldOut === undefined) {
    return undefined
  }

  return {
    blueprintId: blueprintId as number,
    serialNumber: serialNumber as number,
    soldOut: soldOut as boolean,
  }
}

export const getUserToUserPurchaseEventData = (
  events?: CadenceEvent[],
): IListingCompletedEventData | undefined => {
  const eventType = 'NFTStorefront.ListingCompleted'
  const event: CadenceEvent | undefined = findEvent(events ?? [], eventType)

  const { storefrontResourceID, listingResourceID, purchased } = event?.data || {}
  if (
    storefrontResourceID === undefined ||
    listingResourceID === undefined ||
    !purchased // if purchased flag is false then it is a listing removal, not a purchase
  ) {
    return undefined
  }

  return {
    storefrontResourceID: storefrontResourceID as number,
    listingResourceID: listingResourceID as number,
    purchased: purchased as boolean,
  }
}
