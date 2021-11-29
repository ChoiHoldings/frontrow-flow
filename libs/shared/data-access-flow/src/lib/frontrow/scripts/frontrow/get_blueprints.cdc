import FrontRow from "../../contracts/FrontRow.cdc"

// Returns the dictionary of Blueprints

pub fun main(): {UInt32: FrontRow.Blueprint} {
  return FrontRow.getBlueprints()
}