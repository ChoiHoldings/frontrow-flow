import FrontRow from "../../contracts/FrontRow.cdc"

// Return a Blueprint by ID

pub fun main(blueprintId: UInt32): FrontRow.Blueprint? {
  return FrontRow.getBlueprint(id: blueprintId)
}