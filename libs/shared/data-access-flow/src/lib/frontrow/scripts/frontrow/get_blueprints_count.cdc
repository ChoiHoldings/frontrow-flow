import FrontRow from "../../contracts/FrontRow.cdc"

// Returns the number of FrontRow Blueprints that have ever been printed

pub fun main(): UInt32 {
  return FrontRow.getBlueprintsCount()
}