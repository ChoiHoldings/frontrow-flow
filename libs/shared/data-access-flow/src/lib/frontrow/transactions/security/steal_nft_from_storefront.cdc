import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FrontRow from "../../contracts/FrontRow.cdc"
import FrontRowStorefront from "../../contracts/FrontRowStorefront.cdc"

transaction(blueprintId: UInt32, storefrontAddress: Address) {

  let frontrowCollection: &FrontRow.Collection{NonFungibleToken.Receiver}
  let storefront: &FrontRowStorefront.Storefront{FrontRowStorefront.StorefrontPublic}
  let saleOffer: &FrontRowStorefront.SaleOffer{FrontRowStorefront.SaleOfferPublic}

  // The account that's running this transaction is the thief
  prepare(account: AuthAccount) {

    self.storefront = getAccount(storefrontAddress)
      .getCapability<&FrontRowStorefront.Storefront{FrontRowStorefront.StorefrontPublic}>(
          FrontRowStorefront.StorefrontPublicPath
      )
      .borrow()
      ?? panic("Couldn't borrow Storefront from provided address")

    self.saleOffer = self.storefront
        .borrowSaleOffer(blueprintId: blueprintId)
      ?? panic("No Sale Offer with that ID in Storefront.")

    self.frontrowCollection = account.borrow<&FrontRow.Collection{NonFungibleToken.Receiver}>(
      from: FrontRow.CollectionStoragePath
    ) ?? panic("Can't borrow FrontRow collection receiver from account.")
  }

  execute {
    log("LOG: Should not get to this point.")
  }
}