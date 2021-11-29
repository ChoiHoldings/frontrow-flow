import FrontRowStorefront from "../../contracts/FrontRowStorefront.cdc"

transaction(blueprintId: UInt32) {
  let storefront: &FrontRowStorefront.Storefront{FrontRowStorefront.StorefrontManager}

  prepare(account: AuthAccount) {
    self.storefront = account.borrow<&FrontRowStorefront.Storefront{FrontRowStorefront.StorefrontManager}>
        (from: FrontRowStorefront.StorefrontStoragePath)
      ?? panic("Missing or mis-typed Storefront.")
  }

  execute {
    self.storefront.removeSaleOffer(blueprintId: blueprintId)
  }
}
