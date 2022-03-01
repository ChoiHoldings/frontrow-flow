import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import NFTStorefront from "../../contracts/NFTStorefront.cdc"
import FrontRow from "../../contracts/FrontRow.cdc"

pub struct SaleItem {
  pub let nftId: UInt64
  pub let blueprintId: UInt32
  pub let serialNumber: UInt32
  pub let owner: Address
  pub let price: UFix64

  init(nftId: UInt64, blueprintId: UInt32, serialNumber: UInt32, owner: Address, price: UFix64) {
    self.nftId = nftId
    self.blueprintId = blueprintId
    self.serialNumber = serialNumber
    self.owner = owner
    self.price = price
  }
}

pub fun main(address: Address, listingResourceID: UInt64): SaleItem? {
  let account = getAccount(address)

  if let storefrontRef = account.getCapability<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(NFTStorefront.StorefrontPublicPath).borrow() {
    if let listing = storefrontRef.borrowListing(listingResourceID: listingResourceID) {
      let details = listing.getDetails()

      let nftId = details.nftID
      let itemPrice = details.salePrice

      if let collection = account.getCapability<&FrontRow.Collection{NonFungibleToken.CollectionPublic, FrontRow.CollectionPublic}>(FrontRow.CollectionPublicPath).borrow() {
        if let item = collection.borrowFrontRowNFT(id: nftId) {
          return SaleItem(nftId: nftId, blueprintId: item.blueprintId, serialNumber: item.serialNumber, owner: address, price: itemPrice)
        }
      }
    }
  }

  return nil
}
