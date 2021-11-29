import FrontRow from "../../contracts/FrontRow.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"

pub struct FrontRowNFT {
  pub let id: UInt64
  pub let blueprintId: UInt32
  pub let serialNumber: UInt32
  pub let metadata: {String:String}
  pub let owner: Address

  init(id: UInt64, blueprintId: UInt32, serialNumber: UInt32,
      metadata: {String:String}, owner: Address) {
    self.id = id
    self.blueprintId = blueprintId
    self.serialNumber = serialNumber
    self.metadata = metadata
    self.owner = owner
  }
}

pub fun main(address: Address, blueprintId: UInt32, serialNumber: UInt32): FrontRowNFT? {
  if let collection = getAccount(address)
      .getCapability<&FrontRow.Collection{NonFungibleToken.CollectionPublic,
      FrontRow.CollectionPublic}>(FrontRow.CollectionPublicPath).borrow() {

    if let nft = collection.borrowNftByBlueprint(
      blueprintId: blueprintId,
      serialNumber: serialNumber
    ) {
      //
      let blueprint: FrontRow.Blueprint = FrontRow.getBlueprints()[nft.blueprintId]!

      //
      return FrontRowNFT(
        id: nft.id,
        blueprintId: nft.blueprintId,
        serialNumber: nft.serialNumber,
        metadata: blueprint.metadata,
        owner: address
      )
    }
  }

  return nil
}