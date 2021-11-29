import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FrontRow from "../../contracts/FrontRow.cdc"

// prints a new Blueprint
transaction(maxQuantity: UInt32, metadata: {String:String}) {

  // local variable for storing the Admin reference
  let admin: &FrontRow.Admin

  prepare(signer: AuthAccount) {
    // borrow a reference to the Admin resource in storage
    self.admin = signer.borrow<&FrontRow.Admin>(from: FrontRow.AdminStoragePath)
      ?? panic("Could not borrow a reference to the Admin.")
  }

  execute {
    self.admin.printBlueprint(maxQuantity: maxQuantity, metadata: metadata)
  }
}
