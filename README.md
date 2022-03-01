# FrontRow Flow Contracts

The Cadence contracts defined in this repository are for use on the FrontRow platform at [frontrow.kr](https://frontrow.kr)

The contracts and tests have been extracted from an [Nx](https://nx.dev/) monorepo.

## Overview

See the Readme in [apps/flow-test](./apps/flow-test#frontrow-flow-contracts)

## Usage

### Setup

The Flow CLI must be installed and available globally:

```bash
# Mac
brew install flow-cli

# Linux
sh -ci "$(curl -fsSL https://storage.googleapis.com/flow-cli/install.sh)"
```

**Install packages**

```bash
npm install
```

### Testing

```
npm run flow-test
```

When running transactions via the emulator, you can print logs using the `log()` function and prefixing the output with `LOG:`, e.g.

```
transaction() {
  execute {
    log("LOG: HELLO!!!")
  }
}
```

### Deploy

**Local (emulator)**

```
npm run flow-dev
```

**Docker (emulator)**

```
docker build --progress=plain --no-cache -t flow-dev -f apps/flow-test/Dockerfile --target=dev .
```

**Testnet**

- Requires `flow-testnet.json` with `accounts/testnet-account`
- Import aliases must be set up correctly

Create FrontRow

```sh
flow accounts add-contract FrontRow ./libs/shared/data-access-flow/src/lib/frontrow/contracts/FrontRow.cdc --signer testnet-account -n testnet -f flow.json -f flow-testnet.json
```

Create FrontRowStorefront

```
flow accounts add-contract FrontRowStorefront ./libs/shared/data-access-flow/src/lib/frontrow/contracts/FrontRowStorefront.cdc --signer testnet-account -n testnet -f flow.json -f flow-testnet.json
```

**Update**

Use the above commands, but replace `add-contract` with `update-contract`

## Organization

- [apps/flow-test](./apps/flow-test)
  - An Nx app containing all the unit tests for the FrontRow contracts
  - `npm run flow-test` runs the tests
  - `npm run flow-dev` starts the emulator with a basic dev environment
    - FrontRow and FrontrowStorefront contracts deployed, with some Flow and FUSD minted to the `emulator-account`
- [libs/shared/data-access-flow](./libs/shared/data-access-flow)
  - Contains the [FrontRow contracts](./libs/shared/data-access-flow/src/lib/frontrow) and some utilities for interacting with them
- [libs/shared/util-flow](./libs/shared/util-flow)
  - Flow related utility library with no local sub-dependencies
- [libs/shared/util-flow-crypto](./libs/shared/util-flow-crypto)
  - Library for signing Flow transactions with a private key
  - Only used in development and testing
- [libs/shared/util-core](./libs/shared/util-core)
  - Low level utilities shared between Flow/frontend/backend
