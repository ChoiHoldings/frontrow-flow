import FungibleToken from "../../contracts/FungibleToken.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FUSD from "../../contracts/FUSD.cdc"
import FrontRow from "../../contracts/FrontRow.cdc"
import NFTStorefront from "../../contracts/NFTStorefront.cdc"

pub fun getOrCreateCollection(account: AuthAccount): &FrontRow.Collection{NonFungibleToken.Receiver} {
  if let collectionRef = account.borrow<&FrontRow.Collection>(from: FrontRow.CollectionStoragePath) {
    return collectionRef
  }

  // create a new empty collection
  let collection <- FrontRow.createEmptyCollection() as! @FrontRow.Collection

  let collectionRef = &collection as &FrontRow.Collection

  // save it to the account
  account.save(<-collection, to: FrontRow.CollectionStoragePath)

  // create a public capability for the collection
  account.link<&FrontRow.Collection{NonFungibleToken.CollectionPublic, FrontRow.CollectionPublic}>(FrontRow.CollectionPublicPath, target: FrontRow.CollectionStoragePath)

  return collectionRef
}

transaction(listingResourceID: UInt64, storefrontAddress: Address) {

  let paymentVault: @FungibleToken.Vault
  let frontRowCollection: &FrontRow.Collection{NonFungibleToken.Receiver}
  let storefront: &NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}
  let listing: &NFTStorefront.Listing{NFTStorefront.ListingPublic}

  prepare(account: AuthAccount) {
    self.storefront = getAccount(storefrontAddress)
      .getCapability<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(
        NFTStorefront.StorefrontPublicPath
      )!
      .borrow()
      ?? panic("Could not borrow Storefront from provided address")

    self.listing = self.storefront.borrowListing(listingResourceID: listingResourceID)
      ?? panic("No Listing with that ID in Storefront")
  
    let price = self.listing.getDetails().salePrice

    let mainFUSDVault = account.borrow<&FUSD.Vault>(from: /storage/fusdVault)
      ?? panic("Cannot borrow FUSD vault from account storage")
  
    self.paymentVault <- mainFUSDVault.withdraw(amount: price)

    self.frontRowCollection = getOrCreateCollection(account: account)
  }

  execute {
    let item <- self.listing.purchase(
      payment: <-self.paymentVault
    )

    self.frontRowCollection.deposit(token: <-item)

    self.storefront.cleanup(listingResourceID: listingResourceID)
  }
}
