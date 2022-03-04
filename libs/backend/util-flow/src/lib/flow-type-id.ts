import { getEventId } from '@samatech/onflow-ts'
import { flowConfig } from './flow.config'

/**
 * The FrontRow NFT type id.
 * e.g. A.01cf0e2f2f715450.FrontRow.NFT
 *
 * Note: This is FrontRow NFT type
 */
export const frontRowNftTypeId = getEventId(
  flowConfig.get('flowFrontRowAddress'),
  'FrontRow',
  'NFT',
)

/**
 * The FrontRowStorefront Purchase event type id.
 * e.g. A.01cf0e2f2f715450.FrontRowStorefront.Purchase
 *
 * Note: This event is fired when the admin-to-user purchase is successfully completed.
 */
export const adminToUserPurchaseEventTypeId = getEventId(
  flowConfig.get('flowFrontRowStorefrontAddress'),
  'FrontRowStorefront',
  'Purchase',
)

/**
 * The NFTStorefront ListingAvailable event type id.
 * e.g. A.01cf0e2f2f715450.NFTStorefront.ListingAvailable
 *
 * Note: This event is fired when a user-to-user sale listing is created.
 */
export const listingAvailableEventTypeId = getEventId(
  flowConfig.get('flowNftStorefrontAddress'),
  'NFTStorefront',
  'ListingAvailable',
)

/**
 * The NFTStorefront ListingCompleted event type id.
 * e.g. A.01cf0e2f2f715450.NFTStorefront.ListingCompleted
 *
 * Note: This event is fired when a user-to-user sale listing is removed
 * and it is removed in 2 cases:
 *   - user no longer wants to sell the corresponding NFT (purchased: false)
 *   - NFT was sold (purchased: true)
 * To tell these 2 cases apart we are going to look at the `purchased` flag that the
 * event will emit.
 */
export const listingCompletedEventTypeId = getEventId(
  flowConfig.get('flowNftStorefrontAddress'),
  'NFTStorefront',
  'ListingCompleted',
)

/**
 * The FUSD TokensWithdrawn event type id.
 * e.g. A.01cf0e2f2f715450.FUSD.TokensWithdrawn
 *
 * Note: This event is fired when NFT token changes hands.
 */
export const fusdTokensWithdrawnEventTypeId = getEventId(
  flowConfig.get('flowFusdAddress'),
  'FUSD',
  'TokensWithdrawn',
)

/**
 * The FrontRow Deposit event type id.
 * e.g. A.01cf0e2f2f715450.FrontRow.Deposit
 *
 * Note: This event is fired when NFT token changes hands.
 */
export const frontRowNftDepositEventTypeId = getEventId(
  flowConfig.get('flowFrontRowAddress'),
  'FrontRow',
  'Deposit',
)

/**
 * The FrontRow Withdraw event type id.
 * e.g. A.01cf0e2f2f715450.FrontRow.Withdraw
 *
 * Note: This event is fired when NFT token changes hands.
 */
export const frontRowNftWithdrawEventTypeId = getEventId(
  flowConfig.get('flowFrontRowAddress'),
  'FrontRow',
  'Withdraw',
)
