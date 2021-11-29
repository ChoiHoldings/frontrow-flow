import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FrontRow from "../../contracts/FrontRow.cdc"

// Configures an account to hold FrontRow NFTs

transaction {
  prepare(signer: AuthAccount) {
    // if the account doesn't already have a collection
    if signer.borrow<&FrontRow.Collection>(from: FrontRow.CollectionStoragePath) == nil {

      // create a new empty collection
      let collection <- FrontRow.createEmptyCollection()

      // save it to the account
      signer.save(<-collection, to: FrontRow.CollectionStoragePath)

      // create a public capability for the collection
      signer.link<
        &FrontRow.Collection{NonFungibleToken.CollectionPublic, FrontRow.CollectionPublic}
      >(
        FrontRow.CollectionPublicPath,
        target: FrontRow.CollectionStoragePath
      )
    }
  }
}
