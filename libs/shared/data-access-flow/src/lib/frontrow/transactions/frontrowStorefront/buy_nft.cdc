import FungibleToken from "../../contracts/FungibleToken.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FUSD from "../../contracts/FUSD.cdc"
import FrontRow from "../../contracts/FrontRow.cdc"
import FrontRowStorefront from "../../contracts/FrontRowStorefront.cdc"

transaction(blueprintId: UInt32, storefrontAddress: Address) {

  let paymentVault: @FUSD.Vault
  let frontrowCollection: &FrontRow.Collection{NonFungibleToken.Receiver}
  let storefront: &FrontRowStorefront.Storefront{FrontRowStorefront.StorefrontPublic}
  let saleOffer: &FrontRowStorefront.SaleOffer{FrontRowStorefront.SaleOfferPublic}

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

    let price = self.saleOffer.getDetails().price

    let mainFUSDVault = account.borrow<&FUSD.Vault>(from: /storage/fusdVault)
      ?? panic("Can't borrow FUSD vault from account storage.")

    self.paymentVault <- (mainFUSDVault.withdraw(amount: price) as! @FUSD.Vault)

    self.frontrowCollection = account.borrow<&FrontRow.Collection{NonFungibleToken.Receiver}>(
      from: FrontRow.CollectionStoragePath
    ) ?? panic("Can't borrow FrontRow collection receiver from account.")
  }

  execute {
    let purchasedNft <- self.saleOffer.purchase(
      payment: <-self.paymentVault
    )
    self.frontrowCollection.deposit(token: <-purchasedNft)
  }
}
