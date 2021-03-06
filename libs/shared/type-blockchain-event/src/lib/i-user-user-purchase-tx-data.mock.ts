import { TransactionData } from '@samatech/onflow-fcl-esm'

export const UserUserPurchaseTxDataMock: TransactionData = {
  status: 4,
  statusCode: 0,
  errorMessage: '',
  events: [
    {
      blockId: '258585bec117db2895289da572a8ec80ee8ef8ef9134c4f9d74b9ff505a63c57',
      blockHeight: 23839302,
      blockTimestamp: '2022-02-10T04:13:13.061Z',
      type: 'A.f8d6e0586b0a20c7.FUSD.TokensWithdrawn',
      transactionId: '258585bec117db2895289da572a8ec80ee8ef8ef9134c4f9d74b9ff505a63c57',
      transactionIndex: 1,
      eventIndex: 0,
      data: {
        amount: '199.99000000',
        from: '0x179b6b1cb6755e31',
      },
    },
    {
      blockId: '258585bec117db2895289da572a8ec80ee8ef8ef9134c4f9d74b9ff505a63c57',
      blockHeight: 23839302,
      blockTimestamp: '2022-02-10T04:13:13.061Z',
      type: 'A.f8d6e0586b0a20c7.FrontRow.Withdraw',
      transactionId: '258585bec117db2895289da572a8ec80ee8ef8ef9134c4f9d74b9ff505a63c57',
      transactionIndex: 1,
      eventIndex: 1,
      data: {
        id: 2,
        from: '0x01cf0e2f2f715450',
      },
    },
    {
      blockId: '258585bec117db2895289da572a8ec80ee8ef8ef9134c4f9d74b9ff505a63c57',
      blockHeight: 23839302,
      blockTimestamp: '2022-02-10T04:13:13.061Z',
      type: 'A.f8d6e0586b0a20c7.FUSD.TokensWithdrawn',
      transactionId: '258585bec117db2895289da572a8ec80ee8ef8ef9134c4f9d74b9ff505a63c57',
      transactionIndex: 1,
      eventIndex: 2,
      data: {
        amount: '199.99000000',
        from: null,
      },
    },
    {
      blockId: '258585bec117db2895289da572a8ec80ee8ef8ef9134c4f9d74b9ff505a63c57',
      blockHeight: 23839302,
      blockTimestamp: '2022-02-10T04:13:13.061Z',
      type: 'A.f8d6e0586b0a20c7.FUSD.TokensDeposited',
      transactionId: '258585bec117db2895289da572a8ec80ee8ef8ef9134c4f9d74b9ff505a63c57',
      transactionIndex: 1,
      eventIndex: 3,
      data: {
        amount: '199.99000000',
        to: '0x01cf0e2f2f715450',
      },
    },
    {
      blockId: '258585bec117db2895289da572a8ec80ee8ef8ef9134c4f9d74b9ff505a63c57',
      blockHeight: 23839302,
      blockTimestamp: '2022-02-10T04:13:13.061Z',
      type: 'A.f8d6e0586b0a20c7.FUSD.TokensDeposited',
      transactionId: '258585bec117db2895289da572a8ec80ee8ef8ef9134c4f9d74b9ff505a63c57',
      transactionIndex: 1,
      eventIndex: 4,
      data: {
        amount: '0.00000000',
        to: '0x01cf0e2f2f715450',
      },
    },
    {
      blockId: '258585bec117db2895289da572a8ec80ee8ef8ef9134c4f9d74b9ff505a63c57',
      blockHeight: 23839302,
      blockTimestamp: '2022-02-10T04:13:13.061Z',
      type: 'A.f8d6e0586b0a20c7.NFTStorefront.ListingCompleted',
      transactionId: '258585bec117db2895289da572a8ec80ee8ef8ef9134c4f9d74b9ff505a63c57',
      transactionIndex: 1,
      eventIndex: 5,
      data: {
        listingResourceID: 45,
        storefrontResourceID: 44,
        purchased: true,
      },
    },
    {
      blockId: '258585bec117db2895289da572a8ec80ee8ef8ef9134c4f9d74b9ff505a63c57',
      blockHeight: 23839302,
      blockTimestamp: '2022-02-10T04:13:13.061Z',
      type: 'A.f8d6e0586b0a20c7.FrontRow.Deposit',
      transactionId: '258585bec117db2895289da572a8ec80ee8ef8ef9134c4f9d74b9ff505a63c57',
      transactionIndex: 1,
      eventIndex: 6,
      data: {
        id: 2,
        to: '0x179b6b1cb6755e31',
      },
    },
  ],
}
