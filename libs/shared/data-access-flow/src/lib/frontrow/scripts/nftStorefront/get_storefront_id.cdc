import NFTStorefront from "../../contracts/NFTStorefront.cdc"

// This script returns Storefront UUID for the given address

pub fun main(address: Address): UInt64 {
  let account = getAccount(address)

  let storefrontRef = account
    .getCapability<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(
      NFTStorefront.StorefrontPublicPath
    )
    .borrow()
    ?? panic("Could not borrow public storefront from address")
  
  return storefrontRef.uuid
}
