import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FrontRow from "../../contracts/FrontRow.cdc"
import FrontRowStorefront from "../../contracts/FrontRowStorefront.cdc"

transaction(nftId: UInt64, ownerAddress: Address) {

  let providerCollection: &FrontRow.Collection{NonFungibleToken.Provider}
  let receiverCollection: &FrontRow.Collection{NonFungibleToken.Receiver}

  // The owner account is the victim
  // The account that's running this transaction is the thief
  prepare(account: AuthAccount) {

    self.receiverCollection = account
      .borrow<&FrontRow.Collection{NonFungibleToken.Receiver}>(
        from: FrontRow.CollectionStoragePath
      )
      ?? panic("Can't borrow FrontRow collection receiver from account.")

    self.providerCollection = getAccount(ownerAddress)
      .getCapability<&FrontRow.Collection{NonFungibleToken.Provider}>(
          FrontRow.CollectionPublicPath
      )
      .borrow()
      ?? panic("Couldn't borrow FrontRow collection provider from account.")
  }

  execute {
    let nft <-self.providerCollection
      .borrowFrontRowNFT(nftID)!.withdraw(withdrawID: nftID)
    self.receiverCollection.deposit(token: <-nft)
  }
}