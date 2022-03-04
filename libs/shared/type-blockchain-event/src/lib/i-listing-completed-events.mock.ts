import { CadenceEvent } from '@samatech/onflow-fcl-esm'

export const ListingCompletedEventsMock: CadenceEvent[] = [
  {
    blockId: 'b6005443c0874c8a2f3cd9b3613732e6163a66b534215144643a8ed12e5d3383',
    blockHeight: 23839302,
    blockTimestamp: '2022-02-10T04:13:13.061Z',
    type: 'A.4eb8a10cb9f87357.NFTStorefront.ListingCompleted',
    transactionId: 'e5ce3ee769daf85d2efda33c83aa5b8e337756b3da26962bbea91129b1b205a7',
    transactionIndex: 2,
    eventIndex: 0,
    data: {
      listingResourceID: 138093332,
      storefrontResourceID: 108916922,
      purchased: false,
    },
  },
  {
    blockId: '13a91716a9568f58e4309013483752abb24ed47c0701322354207caa8d5e7706',
    blockHeight: 23839313,
    blockTimestamp: '2022-02-10T04:13:27.626Z',
    type: 'A.4eb8a10cb9f87357.NFTStorefront.ListingCompleted',
    transactionId: 'f54f181609b5928cf43564cd5897da65304d18ed55eec0add434034d521b3b28',
    transactionIndex: 0,
    eventIndex: 0,
    data: {
      listingResourceID: 138283200,
      storefrontResourceID: 111961415,
      purchased: false,
    },
  },
  {
    blockId: '3f34fe2d0227adca566d7eb818114052c8951edf35b88c575a9bc54741aadf79',
    blockHeight: 23839351,
    blockTimestamp: '2022-02-10T04:14:41.577Z',
    type: 'A.4eb8a10cb9f87357.NFTStorefront.ListingCompleted',
    transactionId: '7a5589fc91e7a758f78a5a5f5439606e502710267fb97da52280b28822fd8d1e',
    transactionIndex: 1,
    eventIndex: 7,
    data: {
      listingResourceID: 132326480,
      storefrontResourceID: 131716917,
      purchased: true,
    },
  },
  {
    blockId: 'c203e7d7faf0f80136801d8354c21575d39077bb014a5f01cf443111bada4eac',
    blockHeight: 23839356,
    blockTimestamp: '2022-02-10T04:14:48.392Z',
    type: 'A.4eb8a10cb9f87357.NFTStorefront.ListingCompleted',
    transactionId: 'ec0c1aa2cb3b19b3adf3c73c967cd66c91e7b7d9b000ca8559d6c44c39c67530',
    transactionIndex: 3,
    eventIndex: 10,
    data: {
      listingResourceID: 138378671,
      storefrontResourceID: 133770160,
      purchased: true,
    },
  },
]

export const ListingRemovedValid: CadenceEvent = {
  blockId: '3f34fe2d0227adca566d7eb818114052c8951edf35b88c575a9bc54741aadf79',
  blockHeight: 23839351,
  blockTimestamp: '2022-02-10T04:14:41.577Z',
  type: 'A.4eb8a10cb9f87357.NFTStorefront.ListingCompleted',
  transactionId: '7a5589fc91e7a758f78a5a5f5439606e502710267fb97da52280b28822fd8d1e',
  transactionIndex: 1,
  eventIndex: 7,
  data: {
    listingResourceID: 132326480,
    storefrontResourceID: 131716917,
    purchased: false,
    nftType: 'A.8b148183c28ff88f.FrontRow.NFT',
    nftID: 900,
  },
}

export const UserToUserPurchaseValid: CadenceEvent = {
  blockId: '3f34fe2d0227adca566d7eb818114052c8951edf35b88c575a9bc54741aadf79',
  blockHeight: 23839351,
  blockTimestamp: '2022-02-10T04:14:41.577Z',
  type: 'A.4eb8a10cb9f87357.NFTStorefront.ListingCompleted',
  transactionId: '7a5589fc91e7a758f78a5a5f5439606e502710267fb97da52280b28822fd8d1e',
  transactionIndex: 1,
  eventIndex: 7,
  data: {
    listingResourceID: 132326480,
    storefrontResourceID: 131716917,
    purchased: false,
    nftType: 'A.8b148183c28ff88f.FrontRow.NFT',
    nftID: 900,
  },
}

export const NotFrontRowListingCompleted: CadenceEvent = {
  blockId: '3f34fe2d0227adca566d7eb818114052c8951edf35b88c575a9bc54741aadf79',
  blockHeight: 23839351,
  blockTimestamp: '2022-02-10T04:14:41.577Z',
  type: 'A.4eb8a10cb9f87357.SomeStorefront.ListingCompleted',
  transactionId: '7a5589fc91e7a758f78a5a5f5439606e502710267fb97da52280b28822fd8d1e',
  transactionIndex: 1,
  eventIndex: 7,
  data: {
    listingResourceID: 132326480,
    storefrontResourceID: 131716917,
    purchased: true,
    nftType: 'A.8b148183c28ff88f.Gaia.NFT',
    nftID: 900,
  },
}
