import FungibleToken from "../../contracts/FungibleToken.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FUSD from "../../contracts/FUSD.cdc"
import FrontRow from "../../contracts/FrontRow.cdc"
import FrontRowStorefront from "../../contracts/FrontRowStorefront.cdc"

transaction(blueprintId: UInt32, price: UFix64) {

  let fusdReceiver: Capability<&FUSD.Vault{FungibleToken.Receiver}>
  let frontrowNFTsProvider: Capability<&FrontRow.Collection{NonFungibleToken.Provider,
    FrontRow.CollectionPublic}>
  let storefront: &FrontRowStorefront.Storefront

  prepare(account: AuthAccount) {
    // Create a provider capability if one is not provided by default
    let frontrowNFTCollectionProviderPrivatePath = /private/frontrowNFTCollectionProvider

    self.fusdReceiver =
      account.getCapability<&FUSD.Vault{FungibleToken.Receiver}>(/public/fusdReceiver)

    assert(self.fusdReceiver.borrow() != nil,
      message: "Missing or mis-typed FrontRow NFT receiver.")

    if !account.getCapability<&FrontRow.Collection{NonFungibleToken.Provider,
        FrontRow.CollectionPublic}>(frontrowNFTCollectionProviderPrivatePath).check() {
      account.link<&FrontRow.Collection{NonFungibleToken.Provider,
        FrontRow.CollectionPublic}>(frontrowNFTCollectionProviderPrivatePath,
        target: FrontRow.CollectionStoragePath)
    }

    self.frontrowNFTsProvider =
      account.getCapability<&FrontRow.Collection{NonFungibleToken.Provider,
      FrontRow.CollectionPublic}>(frontrowNFTCollectionProviderPrivatePath)

    assert(self.frontrowNFTsProvider.borrow() != nil,
      message: "Missing or mis-typed FrontRow.Collection provider.")

    self.storefront =
        account.borrow<&FrontRowStorefront.Storefront>(from:
        FrontRowStorefront.StorefrontStoragePath)
      ?? panic("Missing or mis-typed Storefront.")
  }

  execute {
    self.storefront.createSaleOffer(
      nftProviderCapability: self.frontrowNFTsProvider,
      blueprintId: blueprintId,
      price: price,
      beneficiary: self.fusdReceiver
    )
  }
}
