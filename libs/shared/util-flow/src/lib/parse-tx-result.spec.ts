import { CadenceEvent, TransactionStatus } from '@samatech/onflow-fcl-esm'
import { blueprintIdFromResult, nftSerialNumberFromResult } from './parse-tx-result'

describe('sharedUtilFlow', () => {
  describe('parse transaction result', () => {
    describe('blueprintIdFromResult', () => {
      const blueprintPrintedEvent: CadenceEvent = {
        blockId: 'b6005443c0874c8a2f3cd9b3613732e6163a66b534215144643a8ed12e5d3383',
        blockHeight: 23839302,
        blockTimestamp: '2022-02-10T04:13:13.101Z',
        type: 'A.f8d6e0586b0a20c7.FrontRow.BlueprintPrinted',
        transactionId: '27c335f8f245eaebb792f87610654eb7fb2da6c5db3f8f65e759fa05ed3f40db',
        transactionIndex: 1,
        eventIndex: 0,
        data: {
          id: 7,
          maxQuantity: 10,
        },
      }

      const saleOfferAvailableEvent: CadenceEvent = {
        blockId: 'b6005443c0874c8a2f3cd9b3613732e6163a66b534215144643a8ed12e5d3383',
        blockHeight: 23839302,
        blockTimestamp: '2022-02-10T04:13:13.101Z',
        type: 'A.f8d6e0586b0a20c7.FrontRowStorefront.SaleOfferAvailable',
        transactionId: '27c335f8f245eaebb792f87610654eb7fb2da6c5db3f8f65e759fa05ed3f40db',
        transactionIndex: 1,
        eventIndex: 1,
        data: {
          storefrontAddress: '0xf8d6e0586b0a20c7',
          blueprintId: 7,
          price: '1.00000000',
        },
      }

      const txResult: TransactionStatus = {
        transactionId: '27c335f8f245eaebb792f87610654eb7fb2da6c5db3f8f65e759fa05ed3f40db',
        status: 4,
        statusString: 'SEALED',
        statusCode: 0,
        errorMessage: '',
        events: [],
      }

      it('returns blueprint id from the FrontRow.BlueprintPrinted event', () => {
        txResult.events = [blueprintPrintedEvent, saleOfferAvailableEvent]
        const blueprintId = blueprintIdFromResult(txResult)
        expect(blueprintId).toBe(blueprintPrintedEvent?.data?.id)
      })

      it('returns undefined if no FrontRow.BlueprintPrinted event found', () => {
        txResult.events = [saleOfferAvailableEvent]
        expect(blueprintIdFromResult(txResult)).toBe(undefined)
      })
    })

    describe('nftSerialNumberFromResult', () => {
      const mintEvent: CadenceEvent = {
        blockId: 'b6005443c0874c8a2f3cd9b3613732e6163a66b534215144643a8ed12e5d3383',
        blockHeight: 23839302,
        blockTimestamp: '2022-02-10T04:13:13.101Z',
        type: 'A.f8d6e0586b0a20c7.FrontRow.Minted',
        transactionId: 'aedf1c3142302d1bc6dba667e0cdbedf96ddf8e45b73006ee2e95cc67958d5e7',
        transactionIndex: 1,
        eventIndex: 0,
        data: {
          id: 2,
          blueprintId: 2,
          serialNumber: 1,
        },
      }

      const depositEvent: CadenceEvent = {
        blockId: 'b6005443c0874c8a2f3cd9b3613732e6163a66b534215144643a8ed12e5d3383',
        blockHeight: 23839302,
        blockTimestamp: '2022-02-10T04:13:13.101Z',
        type: 'A.f8d6e0586b0a20c7.FrontRow.Deposit',
        transactionId: 'aedf1c3142302d1bc6dba667e0cdbedf96ddf8e45b73006ee2e95cc67958d5e7',
        transactionIndex: 1,
        eventIndex: 1,
        data: {
          id: 2,
          to: '0xf8d6e0586b0a20c7',
        },
      }

      const txResult: TransactionStatus = {
        blockId: 'b6005443c0874c8a2f3cd9b3613732e6163a66b534215144643a8ed12e5d3383',
        blockHeight: 23839302,
        blockTimestamp: '2022-02-10T04:13:13.101Z',
        transactionId: '0be1366a5f00b8272e0d5af58ec9e822cf3aa4604afab819b87ab7130ddc2297',
        status: 4,
        statusString: 'SEALED',
        statusCode: 0,
        errorMessage: '',
        events: [],
      }

      it('returns blueprint id from the FrontRow.BlueprintPrinted event', () => {
        txResult.events = [mintEvent, depositEvent]
        const nftSerialNumber = nftSerialNumberFromResult(txResult)
        expect(nftSerialNumber).toBe(mintEvent?.data?.serialNumber)
      })

      it('returns undefined if no FrontRow.BlueprintPrinted event found', () => {
        txResult.events = [depositEvent]
        expect(nftSerialNumberFromResult(txResult)).toBe(undefined)
      })
    })
  })
})
