import FrontRowStorefront from "../../contracts/FrontRowStorefront.cdc"

// Returns an array of all the blueprints for sale through a Storefront
pub fun main(address: Address): [UInt32] {
  let account = getAccount(address)

  let storefrontRef = account.getCapability<&FrontRowStorefront.Storefront{FrontRowStorefront.StorefrontPublic}>(
      FrontRowStorefront.StorefrontPublicPath
    )
    .borrow()
    ?? panic("Could not borrow public storefront from address")
  
  return storefrontRef.getSaleOfferIDs()
}
