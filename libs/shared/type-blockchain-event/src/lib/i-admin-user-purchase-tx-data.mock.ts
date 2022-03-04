import { TransactionData } from '@samatech/onflow-fcl-esm'

export const AdminUserPurchaseTxDataMock: TransactionData = {
  status: 4,
  statusCode: 0,
  errorMessage: '',
  events: [
    {
      blockId: 'b6005443c0874c8a2f3cd9b3613732e6163a66b534215144643a8ed12e5d3383',
      blockHeight: 23839302,
      blockTimestamp: '2022-02-10T04:13:13.061Z',
      type: 'A.f8d6e0586b0a20c7.FUSD.TokensWithdrawn',
      transactionId: 'c37b493e4c9c94c50f2c6aec555d8f8fd97b42be0a053ce75f11aceb5022a416',
      transactionIndex: 1,
      eventIndex: 0,
      data: {
        amount: '10.00000000',
        from: '0x01cf0e2f2f715450',
      },
    },
    {
      blockId: 'b6005443c0874c8a2f3cd9b3613732e6163a66b534215144643a8ed12e5d3383',
      blockHeight: 23839302,
      blockTimestamp: '2022-02-10T04:13:13.061Z',
      type: 'A.f8d6e0586b0a20c7.FrontRow.Withdraw',
      transactionId: 'c37b493e4c9c94c50f2c6aec555d8f8fd97b42be0a053ce75f11aceb5022a416',
      transactionIndex: 1,
      eventIndex: 1,
      data: {
        id: 1,
        from: '0xf8d6e0586b0a20c7',
      },
    },
    {
      blockId: 'b6005443c0874c8a2f3cd9b3613732e6163a66b534215144643a8ed12e5d3383',
      blockHeight: 23839302,
      blockTimestamp: '2022-02-10T04:13:13.061Z',
      type: 'A.f8d6e0586b0a20c7.FUSD.TokensDeposited',
      transactionId: 'c37b493e4c9c94c50f2c6aec555d8f8fd97b42be0a053ce75f11aceb5022a416',
      transactionIndex: 1,
      eventIndex: 2,
      data: {
        amount: '10.00000000',
        to: '0xf8d6e0586b0a20c7',
      },
    },
    {
      blockId: 'b6005443c0874c8a2f3cd9b3613732e6163a66b534215144643a8ed12e5d3383',
      blockHeight: 23839302,
      blockTimestamp: '2022-02-10T04:13:13.061Z',
      type: 'A.f8d6e0586b0a20c7.FrontRowStorefront.Purchase',
      transactionId: 'c37b493e4c9c94c50f2c6aec555d8f8fd97b42be0a053ce75f11aceb5022a416',
      transactionIndex: 1,
      eventIndex: 3,
      data: {
        blueprintId: 1,
        sold: 1,
        soldOut: true,
      },
    },
    {
      blockId: 'b6005443c0874c8a2f3cd9b3613732e6163a66b534215144643a8ed12e5d3383',
      blockHeight: 23839302,
      blockTimestamp: '2022-02-10T04:13:13.061Z',
      type: 'A.f8d6e0586b0a20c7.FrontRow.Deposit',
      transactionId: 'c37b493e4c9c94c50f2c6aec555d8f8fd97b42be0a053ce75f11aceb5022a416',
      transactionIndex: 1,
      eventIndex: 4,
      data: {
        id: 1,
        to: '0x01cf0e2f2f715450',
      },
    },
  ],
}
