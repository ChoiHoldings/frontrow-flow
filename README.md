# FrontRow Flow Contracts

The Cadence contracts defined in this repository are for use on the FrontRow platform at [frontrow.kr](https://frontrow.kr)

The contracts and tests have been extracted from an [Nx](https://nx.dev/) monorepo.

## Overview

See the Readme in [apps/flow-test](./apps/flow-test)

## Usage

**Install packages**

```sh
npm install
```

See the [`flow-test`](./apps/flow-test#testing-1) Readme for testing and dev deploy instructions.

Build a Docker image that runs the emulator and deploys contracts:

```sh
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
