/*
Control which npm packages from the root package.json are included app Dockerfile builds.
See tools/scripts/package-subset.js
*/
const allDev = ["husky"];
const allFlow = [
  "typescript",
  "tslib",
  "ts-node",
  "tsconfig-paths",
  "elliptic",
  "rlp",
  "sha3",
  "@onflow/fcl",
  "@onflow/config",
  "@onflow/fcl-config",
  "@onflow/types",
  "@onflow/util-actor",
  "@onflow/util-invariant",
  "@onflow/util-uid",
  "@jest/console",
  "@types/elliptic",
  "@samatech/onflow-fcl-esm",
];

module.exports = {
  "flow-dev": {
    include: [...allDev, ...allFlow],
  },
};
