import { IBlueprintFixture } from './i-blueprint-fixture'

export interface ISaleOfferFixture {
  price: number
  blueprint: IBlueprintFixture
  blueprintId?: number
}
