import convict from 'convict'

export const flowConfig = convict({
  flowAccessNode: {
    format: String,
    env: 'FLOW_ACCESS_NODE',
    // DO NOT set default here. Use k8s config map instead.
    default: '',
  },
  flowAdminAddress: {
    format: String,
    env: 'FLOW_ADMIN_ADDRESS',
    // Matches accounts/emulator-account/address from flow.json
    // DO NOT set default here. Use k8s config map instead.
    default: '',
  },
  flowAdminPrivateKey: {
    format: String,
    env: 'FLOW_ADMIN_PRIVATE_KEY',
    // Matches accounts/emulator-account/key from flow.json
    // DO NOT set default here. Use k8s config map instead.
    default: '',
  },
  flowFungibleTokenAddress: {
    format: String,
    env: 'FLOW_FUNGIBLETOKEN_ADDRESS',
    // DO NOT set default here. Use k8s config map instead.
    default: '',
  },
  flowFusdAddress: {
    format: String,
    env: 'FLOW_FUSD_ADDRESS',
    // DO NOT set default here. Use k8s config map instead.
    default: '',
  },
  flowNonFungibleTokenAddress: {
    format: String,
    env: 'FLOW_NONFUNGIBLETOKEN_ADDRESS',
    // DO NOT set default here. Use k8s config map instead.
    default: '',
  },
  flowFrontRowAddress: {
    format: String,
    env: 'FLOW_FRONTROW_ADDRESS',
    // DO NOT set default here. Use k8s config map instead.
    default: '',
  },
  flowFrontRowStorefrontAddress: {
    format: String,
    env: 'FLOW_FRONTROWSTOREFRONT_ADDRESS',
    // DO NOT set default here. Use k8s config map instead.
    default: '',
  },
  flowNftStorefrontAddress: {
    format: String,
    env: 'FLOW_NFTSTOREFRONT_ADDRESS',
    // DO NOT set default here. Use k8s config map instead.
    default: '',
  },
})
