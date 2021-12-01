import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FrontRowStorefront from "../../contracts/FrontRowStorefront.cdc"
import FrontRow from "../../contracts/FrontRow.cdc"

pub struct SaleOfferDetails {
  pub let blueprintId: UInt32
  pub let owner: Address
  pub let price: UFix64
  pub let sold: UInt32

  init(blueprintId: UInt32, owner: Address, price: UFix64, sold: UInt32) {
    self.blueprintId = blueprintId
    self.owner = owner
    self.price = price
    self.sold = sold
  }
}

pub fun main(address: Address, blueprintId: UInt32): SaleOfferDetails? {
  let account = getAccount(address)

  if let storefrontRef = account.getCapability<&FrontRowStorefront.Storefront{FrontRowStorefront.StorefrontPublic}>(FrontRowStorefront.StorefrontPublicPath).borrow() {
    if let saleOffer = storefrontRef.borrowSaleOffer(blueprintId: blueprintId) {
      let details = saleOffer.getDetails()

      if let collection = account.getCapability<&FrontRow.Collection{NonFungibleToken.CollectionPublic, FrontRow.CollectionPublic}>(FrontRow.CollectionPublicPath).borrow() {
        return SaleOfferDetails(
          blueprintId: details.blueprintId,
          owner: address,
          price: details.price,
          sold: details.sold
        )
      }
    }
  }
  return nil
}
