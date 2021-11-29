// Match Blueprint fixtures in @ismedia/shared/util-db-fixtures

export const blueprintZoInSung = {
  metadata: {
    artist: 'Zo In Sung',
    title: 'Zo In Sung',
    type: 'nft',
  },
  price: 1200,
  maxQuantity: 10,
}

export const blueprintSooAe = {
  metadata: {
    artist: 'Soo Ae',
    title: 'Soo Ae',
    type: 'drop',
  },
  price: 230,
  maxQuantity: 5,
}

export const blueprintLeeDaHee = {
  metadata: {
    artist: 'Lee Da-hee',
    title: 'Lee Da-hee',
    type: 'nft',
  },
  price: 1700,
  // TODO -- computation limit exceeded
  maxQuantity: 210,
}

export const blueprintFixtures = [blueprintZoInSung, blueprintSooAe, blueprintLeeDaHee]
