# FrontRow Flow Contracts

## Definitions

**Admin** - FrontRow platform administrator account

**Collector** - A non-privileged user with a Flow account

**FrontRow NFT** - A non-fungible token on the FrontRow platform is a unique digital representation of IP ownership. IP is provided by a celebrity or their agency. An NFT is created when an admin mints or batch mints according to the rules in a Blueprint. Each NFT contains a global unique ID, a reference to a Blueprint, and a **serialNumber**. The **serialNumber** differentiates NFTs created from the same Blueprint.

**Blueprint** - A struct that represents rules about how a FrontRow NFT can be minted, and contains metadata shared by related NFTs.

**SaleOffer** - A resource that represents a sale on the FrontRow platform. Sale offers are created for blueprints (not individual NFTs) and they keep track of how many NFTs of a specific blueprint have been sold.

## Contracts Overview

The FrontRow Flow contracts serve the following purposes for the platform:

- FrontRow NFT pre-minting
- Collection for storing FrontRow NFTs
- Post direct NFT sales

### FrontRow

The FrontRow contract manages all NFTs on the platform. It allows a platform Admin to print Blueprints, which contain rules about how NFTs can be minted. The **maxQuantity** of a Blueprint restricts the number of NFTs which may be minted from the Blueprint. The **metadata** contains blueprint description such as artist: 'BTS', title: 'Permission to Dance' etc.

An Admin may mint one or more FrontRow NFTs from a Blueprint in a single transaction.

An Admin may cancel a Blueprint at any time, which irreversibly blocks NFTs from being minted from the Blueprint.

An Admin may batch-mint NFTs from a Blueprint, up to the Blueprint's maxQuantity.

The FrontRow contract provides a Collection for both Admins and Collectors to manage their FrontRow NFTs. A Collection allows users to receive and trade NFTs.

The FrontRow contract allows users to iterate through Blueprints, and retrieve (view) individual Blueprints by ID.

### FrontRowStorefront

The FrontRowStorefront contract manages SaleOffers for the platform. It allows an Admin to create and remove SaleOffers, and Collectors to purchase a FrontRow NFT by making a purchase on a SaleOffer. A SaleOffer can sell NFTs for a Blueprint, up to the **maxQuantity** defined on the Blueprint. If an Admin has batch-minted NFTs from a Blueprint, a pre-existing NFT is transferred to the buyer. If there are no NFTs available, but the Blueprint's maxQuantity has not been met, an NFT is minted on-demand and transferred to the buyer.

A SaleOffer includes a beneficiary which defines where funds are deposited after each sale.

The FrontRowStorefront contract allows users to iterate through SaleOffers, and retrieve (view) SaleOffers by ID.

### Other

The FrontRow contracts make use of some existing Flow contracts.

**FungibleToken** - Parent contract of FUSD. Implements Flow's Fungible Token standard

**FUSD** - Contract that implements Flow's stable coin. The only currency accepted in FrontRow SaleOffers.

**NonFungibleToken** - Parent contract of FrontRow. Implements Flow's Non-Fungible Token standard.

## Inspiration

The FrontRow NFT contract is loosely based on [TopShot](https://github.com/dapperlabs/nba-smart-contracts/blob/master/contracts/TopShot.cdc). The [KittyItems](https://github.com/onflow/kitty-items/blob/master/cadence/contracts/KittyItems.cdc) contract was also referenced during implementation. FrontRow's Blueprints are similar to TopShot plays, though FrontRow does not have a concept of Sets.

The FrontRowStorefront contract takes inspiration from the [KittyItems NFTStorefront](https://github.com/onflow/kitty-items/blob/master/cadence/contracts/NFTStorefront.cdc). The main differences are that it is restricted to only allow Admins to post sales, and one SaleOffer allows purchasing multiple NFTs through Blueprints.
