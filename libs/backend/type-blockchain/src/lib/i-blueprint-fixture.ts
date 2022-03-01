import { IBlueprintMetadata } from './i-blueprint-metadata'

export interface IBlueprintFixture {
  id?: number
  maxQuantity: number
  metadata: IBlueprintMetadata
}
