import FrontRow from "../../contracts/FrontRow.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"

pub fun main(address: Address): Bool {
  if let _ = getAccount(address)
      .getCapability<&FrontRow.Collection{NonFungibleToken.CollectionPublic,
      FrontRow.CollectionPublic}>(FrontRow.CollectionPublicPath).borrow() {
      return true
  }
  return false
}