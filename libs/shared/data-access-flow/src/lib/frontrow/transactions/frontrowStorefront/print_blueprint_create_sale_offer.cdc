import FungibleToken from "../../contracts/FungibleToken.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FUSD from "../../contracts/FUSD.cdc"
import FrontRow from "../../contracts/FrontRow.cdc"
import FrontRowStorefront from "../../contracts/FrontRowStorefront.cdc"

// Prints a new Blueprint and creates a corresponding SaleOffer
// Combination of print_blueprint.cdc and create_sale_offer.cdc
transaction(maxQuantity: UInt32, metadata: {String:String}, price: UFix64) {

  // local variable for storing the Admin reference
  let admin: &FrontRow.Admin
  let fusdReceiver: Capability<&FUSD.Vault{FungibleToken.Receiver}>
  let frontrowNFTsProvider: Capability<&FrontRow.Collection{NonFungibleToken.Provider,
    FrontRow.CollectionPublic}>
  let storefront: &FrontRowStorefront.Storefront
  let minterCapability: Capability<&{FrontRow.Minter}>

  prepare(account: AuthAccount) {
    // borrow a reference to the Admin resource in storage
    self.admin = account.borrow<&FrontRow.Admin>(from: FrontRow.AdminStoragePath)
      ?? panic("Could not borrow a reference to the Admin.")

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

    // Minter capability allows to mint NFTs on demand during purchase
    self.minterCapability =
      account.getCapability<&{FrontRow.Minter}>(FrontRow.MinterPrivatePath)

    assert(self.minterCapability != nil,
      message: "Missing permissions to mint NFTs on demand.")
  }

  execute {
    let blueprintId = self.admin.printBlueprint(
      maxQuantity: maxQuantity,
      metadata: metadata
    )

    self.storefront.createSaleOffer(
      nftProviderCapability: self.frontrowNFTsProvider,
      blueprintId: blueprintId,
      price: price,
      beneficiary: self.fusdReceiver,
      minterCapability: self.minterCapability
    )
  }
}
