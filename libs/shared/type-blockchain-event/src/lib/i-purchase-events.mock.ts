import { CadenceEvent } from '@samatech/onflow-fcl-esm'

export const PurchaseEventsMock: CadenceEvent[] = [
  {
    blockId: '33a91716a9568f58e4309013483752abb24ed47c0701322354207caa8d5e5512',
    blockHeight: 23839314,
    blockTimestamp: '2022-02-10T04:14:02.555Z',
    type: 'A.4eb8a10cb9f87357.FrontRowStorefront.Purchase',
    transactionId: '6e6b385795619a75da313cb082a29fdb2e58f691a74f290d396c1ff98c474057',
    transactionIndex: 2,
    eventIndex: 0,
    data: {
      blueprintId: 1,
      serialNumber: 1,
      soldOut: false,
    },
  },
]

export const PurchaseEventValidMock: CadenceEvent = {
  blockId: '13a91716a9568f58e4309013483752abb24ed47c0701322354207caa8d5e7706',
  blockHeight: 23839313,
  blockTimestamp: '2022-02-10T04:13:27.626Z',
  type: 'A.4eb8a10cb9f87357.NFTStorefront.ListingAvailable',
  transactionId: '6e6b385795619a75da313cb082a29fdb2e58f691a74f290d396c1ff98c474057',
  transactionIndex: 3,
  eventIndex: 0,
  data: {
    storefrontAddress: '0x409fa2c4accd49e8',
    listingResourceID: 138379722,
    nftType: 'A.8b148183c28ff88f.FrontRow.NFT',
    nftID: 900,
    ftVaultType: 'A.ead892083b3e2c6c.FUSD.Vault',
    price: '250.00000000',
  },
}

export const PurchaseEventInvalidMock: CadenceEvent = {
  blockId: '33a91716a9568f58e4309013483752abb24ed47c0701322354207caa8d5e5512',
  blockHeight: 23839314,
  blockTimestamp: '2022-02-10T04:14:02.555Z',
  type: 'A.4eb8a10cb9f87357.OtherContract.Purchase',
  transactionId: '6e6b385795619a75da313cb082a29fdb2e58f691a74f290d396c1ff98c474057',
  transactionIndex: 2,
  eventIndex: 0,
  data: {
    blueprintId: 1,
    sold: 1,
    soldOut: false,
  },
}
