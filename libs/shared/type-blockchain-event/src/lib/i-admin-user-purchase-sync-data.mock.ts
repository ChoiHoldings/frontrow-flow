import { IAdminUserPurchaseSyncData } from './i-admin-user-purchase-sync-data'

export const AdminUserPurchaseSyncDataMock: IAdminUserPurchaseSyncData = {
  transactionId: 'c37b493e4c9c94c50f2c6aec555d8f8fd97b42be0a053ce75f11aceb5022a416',
  blueprintId: 1,
  serialNumber: 1, // alias for "sold" in the FrontRowStorefront.Purchase event
  soldOut: true,
  buyer: '0x01cf0e2f2f715450', // Eve
  amount: '10.00000000',
  nftId: 1, // global nftId
}
