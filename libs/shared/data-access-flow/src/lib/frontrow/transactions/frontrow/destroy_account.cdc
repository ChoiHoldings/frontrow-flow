import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FrontRow from "../../contracts/FrontRow.cdc"

// Removes the FrontRow collection from an account, if it exists

transaction {

  prepare(signer: AuthAccount) {
    let collection = signer.borrow<&FrontRow.Collection{NonFungibleToken.Receiver}>(
      from: FrontRow.CollectionStoragePath
    ) ?? panic("Can't borrow FrontRow collection receiver from account.")

    if collection != nil {
      signer.unlink(FrontRow.CollectionPublicPath)
      destroy <- signer.load<@AnyResource>(from: FrontRow.CollectionStoragePath)
    }

  }

}
