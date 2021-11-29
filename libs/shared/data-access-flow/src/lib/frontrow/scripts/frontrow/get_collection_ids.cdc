import FrontRow from "../../contracts/FrontRow.cdc"

// Returns an array of NFT IDs in a collection
pub fun main(address: Address): [UInt64] {
  let account = getAccount(address)

  let collectionRef = account.getCapability(FrontRow.CollectionPublicPath)
      .borrow<&{FrontRow.CollectionPublic}>()
    ?? panic("Could not borrow capability from public collection")
  
  return collectionRef.getIDs()
}