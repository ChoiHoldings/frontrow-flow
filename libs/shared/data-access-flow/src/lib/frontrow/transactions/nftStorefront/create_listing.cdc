import FungibleToken from "../../contracts/FungibleToken.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FUSD from "../../contracts/FUSD.cdc"
import FrontRow from "../../contracts/FrontRow.cdc"
import NFTStorefront from "../../contracts/NFTStorefront.cdc"

pub fun getOrCreateStorefront(account: AuthAccount): &NFTStorefront.Storefront {
  if let storefrontRef = account.borrow<&NFTStorefront.Storefront>(from: NFTStorefront.StorefrontStoragePath) {
    return storefrontRef
  }

  let storefront <- NFTStorefront.createStorefront()

  let storefrontRef = &storefront as &NFTStorefront.Storefront

  account.save(<-storefront, to: NFTStorefront.StorefrontStoragePath)

  account.link<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(NFTStorefront.StorefrontPublicPath, target: NFTStorefront.StorefrontStoragePath)

  return storefrontRef
}

transaction(saleItemID: UInt64, saleItemPrice: UFix64) {

  let fusdReceiver: Capability<&FUSD.Vault{FungibleToken.Receiver}>
  let nftProvider: Capability<&FrontRow.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>
  let storefront: &NFTStorefront.Storefront

  prepare(account: AuthAccount) {
    // We need a provider capability, but one is not provided by default so we create one if needed.
    let nftCollectionProviderPrivatePath = /private/frontRowCollectionProvider

    self.fusdReceiver = account.getCapability<&FUSD.Vault{FungibleToken.Receiver}>(/public/fusdReceiver)

    assert(self.fusdReceiver.borrow() != nil, message: "Missing or mis-typed FUSD receiver")

    if !account.getCapability<&FrontRow.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(nftCollectionProviderPrivatePath).check() {
      account.link<&FrontRow.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(nftCollectionProviderPrivatePath, target: FrontRow.CollectionStoragePath)
    }

    self.nftProvider = account.getCapability<&FrontRow.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(nftCollectionProviderPrivatePath)

    assert(self.nftProvider.borrow() != nil, message: "Missing or mis-typed FrontRow.Collection provider")

    self.storefront = getOrCreateStorefront(account: account)
  }

  execute {
    let saleCut = NFTStorefront.SaleCut(
      receiver: self.fusdReceiver,
      amount: saleItemPrice
    )
    self.storefront.createListing(
      nftProviderCapability: self.nftProvider,
      nftType: Type<@FrontRow.NFT>(),
      nftID: saleItemID,
      salePaymentVaultType: Type<@FUSD.Vault>(),
      saleCuts: [saleCut]
    )
  }
}
