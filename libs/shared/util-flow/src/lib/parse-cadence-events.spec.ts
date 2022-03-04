import { CadenceEvent } from '@samatech/onflow-fcl-esm'
import {
  IPurchaseEventData,
  IListingCompletedEventData,
} from '@ismedia/shared/type-blockchain-event'
import {
  getBlueprintPurchaseEventData,
  getUserToUserPurchaseEventData,
} from './parse-cadence-events'

const tokensWithdrawnEvent: CadenceEvent = {
  transactionId: '00000000-0000-0000-0000-000000000000',
  transactionIndex: 0,
  eventIndex: 0,
  blockId: 'b6005443c0874c8a2f3cd9b3613732e6163a66b534215144643a8ed12e5d3383',
  blockHeight: 23839302,
  blockTimestamp: '2022-02-10T04:13:13.061Z',
  type: 'FUSD.TokensWithdrawn',
  data: { amount: '5.000000', from: '0x179b6b1cb6755e31' },
}
const tokensDepositedEvent1: CadenceEvent = {
  transactionId: '00000000-0000-0000-0000-000000000001',
  transactionIndex: 1,
  eventIndex: 1,
  blockId: 'b6005443c0874c8a2f3cd9b3613732e6163a66b534215144643a8ed12e5d3383',
  blockHeight: 23839302,
  blockTimestamp: '2022-02-10T04:13:13.071Z',
  type: 'FUSD.TokensDeposited',
  data: { amount: '5.000000', to: '0x01cf0e2f2f715450' },
}
const tokensDepositedEvent2: CadenceEvent = {
  transactionId: '00000000-0000-0000-0000-000000000002',
  transactionIndex: 2,
  eventIndex: 2,
  blockId: 'b6005443c0874c8a2f3cd9b3613732e6163a66b534215144643a8ed12e5d3383',
  blockHeight: 23839302,
  blockTimestamp: '2022-02-10T04:13:13.081Z',
  type: 'FUSD.TokensDeposited',
  data: { amount: '5.000000', to: '0x01cf0e2f2f715450' },
}
const purchaseEvent: CadenceEvent = {
  transactionId: '00000000-0000-0000-0000-000000000003',
  transactionIndex: 3,
  eventIndex: 3,
  blockId: 'b6005443c0874c8a2f3cd9b3613732e6163a66b534215144643a8ed12e5d3383',
  blockHeight: 23839302,
  blockTimestamp: '2022-02-10T04:13:13.091Z',
  type: 'FrontRowStorefront.Purchase',
  data: { blueprintId: 1, serialNumber: 1, soldOut: false },
}
const depositEvent: CadenceEvent = {
  transactionId: '00000000-0000-0000-0000-000000000004',
  transactionIndex: 4,
  eventIndex: 4,
  blockId: 'b6005443c0874c8a2f3cd9b3613732e6163a66b534215144643a8ed12e5d3383',
  blockHeight: 23839302,
  blockTimestamp: '2022-02-10T04:13:13.101Z',
  type: 'FrontRow.Deposit',
  data: { id: 1, to: '0x179b6b1cb6755e31' },
}
const userToUserPurchaseEvent: CadenceEvent = {
  transactionId: '00000000-0000-0000-0000-000000000005',
  transactionIndex: 5,
  eventIndex: 5,
  blockId: 'b6005443c0874c8a2f3cd9b3613732e6163a66b534215144643a8ed12e5d3383',
  blockHeight: 23839302,
  blockTimestamp: '2022-02-10T04:15:15.111Z',
  type: 'NFTStorefront.ListingCompleted',
  data: { storefrontResourceID: 1234567, listingResourceID: 9876543, purchased: true },
}
const listingRemovalEvent: CadenceEvent = {
  transactionId: '00000000-0000-0000-0000-000000000006',
  transactionIndex: 6,
  eventIndex: 6,
  blockId: 'b6005443c0874c8a2f3cd9b3613732e6163a66b534215144643a8ed12e5d3383',
  blockHeight: 23839302,
  blockTimestamp: '2022-02-10T04:20:15.111Z',
  type: 'NFTStorefront.ListingCompleted',
  data: { storefrontResourceID: 12345678, listingResourceID: 8765432, purchased: false },
}

describe('sharedUtilFlow', () => {
  describe('parse Cadence events', () => {
    describe('getBlueprintPurchaseEventData', () => {
      const events: CadenceEvent[] = [
        tokensWithdrawnEvent,
        tokensDepositedEvent1,
        tokensDepositedEvent2,
        purchaseEvent,
        depositEvent,
      ]

      it('returns purchase event data if the Purchase event exists', () => {
        const event: IPurchaseEventData | undefined =
          getBlueprintPurchaseEventData(events)
        expect(event).toEqual(purchaseEvent.data)
      })

      it('returns undefined if no FrontRow.BlueprintPrinted event found', () => {
        const purchaseEvent = getBlueprintPurchaseEventData([])
        expect(purchaseEvent).toBe(undefined)
      })
    })

    describe('getUserToUserPurchaseEventData', () => {
      const events: CadenceEvent[] = [
        tokensWithdrawnEvent,
        userToUserPurchaseEvent,
        listingRemovalEvent,
      ]

      it('returns purchase event data if the Purchase event exists', () => {
        const event: IListingCompletedEventData | undefined =
          getUserToUserPurchaseEventData(events)
        expect(event).toEqual(userToUserPurchaseEvent.data)
      })

      it('returns undefined if no FrontRow.BlueprintPrinted event found', () => {
        const userToUserPurchaseEvent = getUserToUserPurchaseEventData([])
        expect(userToUserPurchaseEvent).toBe(undefined)
      })
    })
  })
})
