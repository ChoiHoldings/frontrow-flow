import { getEventId } from '@samatech/onflow-ts'
import { flowConfig } from './flow.config'

/**
 * The Purchase event is fired when admin-to-user purchase was successfully completed.
 */
export const adminToUserPurchaseEventId = getEventId(
  flowConfig.get('flowFrontRowStorefrontAddress'),
  'FrontRowStorefront',
  'Purchase',
)

/**
 * The ListingAvailable event is fired when a user-to-user sale listing is created.
 */
export const listingAvailableEventId = getEventId(
  flowConfig.get('flowNftStorefrontAddress'),
  'NFTStorefront',
  'ListingAvailable',
)

/**
 * The ListingCompleted event is fired when a user-to-user sale listing is removed
 * and it is removed in 2 cases:
 *   - user no longer wants to sell the corresponding NFT (purchased: false)
 *   - NFT was sold (purchased: true)
 * To tell these 2 cases apart we are going to look at the `purchased` flag that the
 * event will emit.
 */
export const listingCompletedEventId = getEventId(
  flowConfig.get('flowNftStorefrontAddress'),
  'NFTStorefront',
  'ListingCompleted',
)
