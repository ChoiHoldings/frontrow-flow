import FrontRow from "../../contracts/FrontRow.cdc"

// Returns the number of FrontRow NFTs minted
// for the given blueprint
pub fun main(blueprintId: UInt32): UInt32 {
    return FrontRow.getBlueprintMintCount(blueprintId)
}