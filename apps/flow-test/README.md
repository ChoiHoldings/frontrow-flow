# FrontRow Flow Contracts

## Definitions

**Admin** - FrontRow platform administrator account

**FrontRow NFT** - A non-fungible token on the FrontRow platform is a unique digital representation of IP ownership. IP is provided by a celebrity or their agency. An NFT is created when an admin mints or batch mints according to the rules in a Blueprint. Each NFT contains a global unique ID, a reference to a Blueprint, and a serialNumber. The serialNumber differentiates NFTs created from the same Blueprint.

**Blueprint** - A struct that represents rules about how a FrontRow NFT can be minted, and contains metadata shared by related NFTs.

**SaleOffer** - A resource that represents a sale on the FrontRow platform.

## Contracts Overview

The FrontRow Flow contracts serve the following purposes for the platform:

- FrontRow NFT pre-minting
- Collection for storing FrontRow NFTs
- Post direct NFT sales

### FrontRow

The FrontRow contract manages all NFTs on the platform. It allows a platform admin to print Blueprints, which contain rules about how NFTs can be minted. The price (MSRP) of a Blueprint indicates the initial sale price of NFTs minted from the Blueprint. The maxQuantity of a Blueprint restricts the number of NFTs which may be minted from the Blueprint.

An admin may mint one or more FrontRow NFTs from a Blueprint in a single transaction.

An admin may cancel a Blueprint at any time, which irreversibly blocks NFTs from being minted from the Blueprint.

The FrontRow contract provides a Collection for both admins and non-privileged users to manage their FrontRow NFTs. A Collection allows users to receive and trade NFTs.

The FrontRow contract allows users to iterate through Blueprints, and retrieve (view) individual Blueprints by ID.

### FrontRowStorefront

The FrontRowStorefront contract manages SaleOffers for the platform. It allows an admin to create and remove SaleOffers, and non-privileged users to purchase a StoreFront NFT by accepting a SaleOffer.

A SaleOffer includes a beneficiary which defines where funds are deposited after each sale.

The FrontRowStorefront contract allows users to iterate through SaleOffers, and retrieve (view) SaleOffers by ID.

### Other

The FrontRow contracts make use of some existing Flow contracts.

**FungibleToken** - Parent contract of FUSD. Implements Flow's Fungible Token standard

**FUSD** - Contract that implements Flow's stable coin. The only currency accepted in FrontRow SaleOffers.

**NonFungibleToken** - Parent contract of FrontRow. Implements Flow's Non-Fungible Token standard.

## Inspiration

The FrontRow NFT contract is loosely based on [TopShot](https://github.com/dapperlabs/nba-smart-contracts/blob/master/contracts/TopShot.cdc). The [KittyItems](https://github.com/onflow/kitty-items/blob/master/cadence/contracts/KittyItems.cdc) contract was also referenced during implementation. FrontRow's Blueprints are similar to TopShot plays, though FrontRow does not have a concept of Sets.

The FrontRowStorefront contract takes inspiration from the [KittyItems NFTStorefront](https://github.com/onflow/kitty-items/blob/master/cadence/contracts/NFTStorefront.cdc). The main difference is that it is restricted to only allow admins to post sales.

## Testing

### Setup

The Flow CLI must be installed and available globally:

```bash
# Mac
brew install flow-cli

# Linux
sh -ci "$(curl -fsSL https://storage.googleapis.com/flow-cli/install.sh)"
```

### Testing

```
nx test-flow flow-test
```

When running transactions via the emulator, you can print logs using the `log()` function and prefixing the output with `LOG:`, e.g.

```
transaction() {
  execute {
    log("LOG: HELLO!!!")
  }
}
```
