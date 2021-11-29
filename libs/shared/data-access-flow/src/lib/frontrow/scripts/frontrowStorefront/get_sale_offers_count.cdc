import FrontRowStorefront from "../../contracts/FrontRowStorefront.cdc"

// Returns the number of blueprints for sale through a Storefront
pub fun main(account: Address): Int {
	let storefrontRef = getAccount(account)
    .getCapability<&FrontRowStorefront.Storefront{FrontRowStorefront.StorefrontPublic}>(
    FrontRowStorefront.StorefrontPublicPath
  )
  .borrow()
  ?? panic("Could not borrow public storefront from address")

  return storefrontRef.getSaleOfferIDs().length
}