import { IBlueprintFixture, ISaleOfferFixture } from '@ismedia/backend/type-blockchain'

// Blueprints
export const blueprintA: IBlueprintFixture = {
  maxQuantity: 1,
  metadata: {
    artist: 'BTS',
    title: 'Permission to Dance',
    id: 'Axxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  },
}
export const blueprintB: IBlueprintFixture = {
  maxQuantity: 2,
  metadata: {
    artist: 'Exo',
    title: 'Obsession',
    id: 'Bxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  },
}

export const blueprintC: IBlueprintFixture = {
  maxQuantity: 5,
  metadata: {
    artist: 'BLACKPINK',
    title: 'How You Like That',
    id: 'Cxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  },
}

export const blueprintD: IBlueprintFixture = {
  maxQuantity: 3,
  metadata: {
    artist: 'ITZY',
    title: 'WANNABE',
    id: 'Dxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  },
}

export const blueprintE: IBlueprintFixture = {
  maxQuantity: 2,
  metadata: {
    artist: 'UI',
    title: 'Celebrity',
    id: 'Exxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  },
}

export const blueprintF: IBlueprintFixture = {
  maxQuantity: 5,
  metadata: {
    artist: 'BTS',
    title: 'Butter',
    id: 'Fxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  },
}

export const blueprintG: IBlueprintFixture = {
  maxQuantity: 10,
  metadata: {
    artist: 'Swings',
    title: 'Show Me The Money Live',
    id: 'Gxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  },
}

export const blueprintX: IBlueprintFixture = {
  maxQuantity: 300,
  metadata: {
    artist: 'iKON',
    title: 'LOVE SCENARIO',
    id: 'Xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  },
}

// Sale offers
export const saleOfferA: ISaleOfferFixture = {
  price: 1000,
  blueprint: blueprintA,
}
export const saleOfferB: ISaleOfferFixture = {
  price: 250,
  blueprint: blueprintB,
}
export const saleOfferC: ISaleOfferFixture = {
  price: 355,
  blueprint: blueprintC,
}
export const saleOfferD: ISaleOfferFixture = {
  price: 355,
  blueprint: blueprintD,
}
export const saleOfferE: ISaleOfferFixture = {
  price: 800,
  blueprint: blueprintE,
}
export const saleOfferF: ISaleOfferFixture = {
  price: 10000,
  blueprint: blueprintF,
}
export const saleOfferG: ISaleOfferFixture = {
  price: 100,
  blueprint: blueprintG,
}
