import { TransactionData } from '@samatech/onflow-fcl-esm'

export const NewListingTxDataMock: TransactionData = {
  status: 4,
  statusCode: 0,
  errorMessage: '',
  events: [
    {
      blockId: 'd5042c286757db2c7fc70e589758168087a5ba7bdb3099ea667453f9ac7e9bf7',
      blockHeight: 23839302,
      blockTimestamp: '2022-02-10T04:13:13.061Z',
      type: 'A.4eb8a10cb9f87357.NFTStorefront.ListingAvailable',
      transactionId: 'bfb2341c894623fef312f674b667067308c0bb35b1120b2144f79cc5ca7e642d',
      transactionIndex: 1,
      eventIndex: 0,
      data: {
        storefrontAddress: '0x11fb14fcc81b9988',
        listingResourceID: 152658157,
        nftType: 'A.01ab36aaf654a13e.FrontRow.NFT',
        nftID: 154010,
        ftVaultType: 'A.1654653399040a61.FUSD.Vault',
        price: '300.00000000',
      },
    },
    {
      blockId: 'd5042c286757db2c7fc70e589758168087a5ba7bdb3099ea667453f9ac7e9bf7',
      blockHeight: 23839302,
      blockTimestamp: '2022-02-10T04:13:13.061Z',
      type: 'A.1654653399040a61.FlowToken.TokensWithdrawn',
      transactionId: 'bfb2341c894623fef312f674b667067308c0bb35b1120b2144f79cc5ca7e642d',
      transactionIndex: 1,
      eventIndex: 1,
      data: {
        from: '0x55ad22f01ef568a1',
        amount: '0.00001000',
      },
    },
    {
      blockId: 'd5042c286757db2c7fc70e589758168087a5ba7bdb3099ea667453f9ac7e9bf7',
      blockHeight: 23839302,
      blockTimestamp: '2022-02-10T04:13:13.061Z',
      type: 'A.1654653399040a61.FlowToken.TokensDeposited',
      transactionId: 'bfb2341c894623fef312f674b667067308c0bb35b1120b2144f79cc5ca7e642d',
      transactionIndex: 1,
      eventIndex: 2,
      data: {
        amount: '0.00001000',
        to: '0xf919ee77447b7497',
      },
    },

    {
      blockId: 'd5042c286757db2c7fc70e589758168087a5ba7bdb3099ea667453f9ac7e9bf7',
      blockHeight: 23839302,
      blockTimestamp: '2022-02-10T04:13:13.061Z',
      type: 'A.f919ee77447b7497.FlowFees.TokensDeposited',
      transactionId: 'bfb2341c894623fef312f674b667067308c0bb35b1120b2144f79cc5ca7e642d',
      transactionIndex: 1,
      eventIndex: 3,
      data: {
        amount: '0.00001000',
      },
    },
  ],
}
