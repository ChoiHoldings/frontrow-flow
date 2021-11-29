import FrontRow from "../../contracts/FrontRow.cdc"

// Returns the number of FrontRow NFTs that have ever been minted

pub fun main(): UInt64 {
    return FrontRow.totalSupply
}