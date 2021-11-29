import FrontRow from "../../contracts/FrontRow.cdc"

// This transction uses the Admin resource to mint a new NFT.
// It must be run with an account that has the Admin resource.
transaction(recipientAddress: Address, blueprintId: UInt32) {

  // local variable for storing the Admin reference
  let adminRef: &FrontRow.Admin

  prepare(signer: AuthAccount) {
    // borrow a reference to the Admin resource in storage
    self.adminRef = signer.borrow<&FrontRow.Admin>(from: FrontRow.AdminStoragePath)
      ?? panic("Could not borrow a reference to the Admin.")
  }

  execute {
    // Mint a new NFT
    let nft <- self.adminRef.mintNFT(blueprintId: blueprintId)

    // Get the account object for the recipient of the minted tokens
    let recipient = getAccount(recipientAddress)

    // get the Collection reference for the receiver
    let receiverRef = recipient.getCapability(FrontRow.CollectionPublicPath)
      .borrow<&{FrontRow.CollectionPublic}>()
        ?? panic("Could not get receiver reference to the NFT Collection.")

    // deposit the NFT in the receivers collection
    receiverRef.deposit(token: <-nft)
  }
}
