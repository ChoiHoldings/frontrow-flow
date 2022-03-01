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
      sold: 1,
      soldOut: false,
    },
  },
]
