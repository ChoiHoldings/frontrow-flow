import FrontRow from "../../contracts/FrontRow.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"

pub fun main(address: Address, blueprintId: UInt32, serialNumber: UInt32): Bool {
  if let collection = getAccount(address)
      .getCapability<&FrontRow.Collection{NonFungibleToken.CollectionPublic,
      FrontRow.CollectionPublic}>(FrontRow.CollectionPublicPath).borrow() {

    if let nft = collection.borrowNftByBlueprint(
      blueprintId: blueprintId,
      serialNumber: serialNumber
    ) {
      //=
      return nft.owner!.address == address
    }
  }

  return false
}