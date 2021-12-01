import FrontRow from "../../contracts/FrontRow.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"

pub fun main(metadataField: String, metadataValue: String): FrontRow.Blueprint? {
  let blueprints = FrontRow.getBlueprints()

  for blueprintId in blueprints.keys {
    let blueprint: FrontRow.Blueprint = blueprints[blueprintId]!

    // Just a sanity check. In theory we'll never have blueprint == nil
    if (blueprint != nil) {
      for field in blueprint.metadata.keys {
        let value = blueprint.metadata[field]

        // Compare key name and the value of metadata and if if there is
        // a match then return the blueprint
        if (metadataField == field && metadataValue == value) {
          return blueprint
        }
      }
    }
  }
  return nil
}