# FrontRow Flow Contracts

The Cadence contracts defined in this repository are for use on the FrontRow platform at [frontrow.kr](https://frontrow.kr)

The contracts and tests have been extracted from an [Nx](https://nx.dev/) monorepo.

## Overview

See the Readme in [apps/flow-test](./apps/flow-test)

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

Local

```
npm run flow-dev
```

Docker

```
docker build --progress=plain --no-cache -t flow-dev -f apps/flow-test/Dockerfile --target=dev .
```

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
