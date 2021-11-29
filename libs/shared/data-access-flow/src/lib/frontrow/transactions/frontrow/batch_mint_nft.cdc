import FrontRow from "../../contracts/FrontRow.cdc"

// This transction uses the Admin resource to batch mint new NFTs.
// It must be run with an account that has the Admin resource.
transaction(recipientAddress: Address, blueprintId: UInt32, quantity: UInt64) {

  // local variable for storing the Admin reference
  let adminRef: &FrontRow.Admin
  let receiverRef: &AnyResource{FrontRow.CollectionPublic}

  prepare(signer: AuthAccount) {
    // borrow a reference to the Admin resource in storage
    self.adminRef = signer.borrow<&FrontRow.Admin>(from: FrontRow.AdminStoragePath)
      ?? panic("Could not borrow a reference to the Admin.")

    // Get the account object for the recipient of the minted tokens
    let recipient = getAccount(recipientAddress)

    // get the Collection reference for the receiver
    self.receiverRef = recipient.getCapability(FrontRow.CollectionPublicPath)
      .borrow<&{FrontRow.CollectionPublic}>()
        ?? panic("Could not get receiver reference to the NFT Collection.")
  }

  execute {
    // Batch mint NFTs
    self.adminRef.batchMintNFT(
      blueprintId: blueprintId,
      quantity: quantity,
      receiverRef: self.receiverRef
    )
  }
}
