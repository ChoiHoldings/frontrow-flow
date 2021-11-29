import { getAddressMap } from '@ismedia/shared/data-access-flow'
import { FlowAccount, toUFix64 } from '@ismedia/shared/util-flow'
import { AccountManager } from '../lib/accounts'
import { testSetup } from '../lib/common'
import { mintFlow } from '../lib/flow'
import { TEST_CONFIG } from '../utils/config'
import {
  batchMintNFT,
  getBlueprintsCount,
  printBlueprint,
  setupFrontRowCollectionOnAccount,
} from '../utils/frontrow'
import {
  createSaleOffer,
  deployFrontRowStorefront,
  getSaleOfferDetails,
  getSaleOffers,
} from '../utils/frontrowStorefront'
import { mintFusdToAccount, setupFusdOnAccount } from '../utils/fusd'
import { blueprintFixtures } from './fixtures'

const accounts = new AccountManager()

let Admin: FlowAccount
let Dev: FlowAccount

// Mint Flow and FUSD to an account
const prepareAccount = async (account: FlowAccount) => {
  await mintFlow(Admin, account, toUFix64(100.0))
  await setupFusdOnAccount(account)
  await mintFusdToAccount(Admin, account, 100)
  await setupFrontRowCollectionOnAccount(account)
}

const run = async () => {
  const emulator = await testSetup({
    port: 7000,
    basePath: TEST_CONFIG.BASE_PATH,
    cdcDirectories: TEST_CONFIG.CDC_DIRECTORIES,
  })
  Admin = accounts.register('accounts/emulator-account')
  Dev = await accounts.create(Admin, 'accounts/development-account')

  await deployFrontRowStorefront(Admin)
  await setupFrontRowCollectionOnAccount(Admin)
  await prepareAccount(Dev)

  for (let i = 0; i < blueprintFixtures.length; i += 1) {
    const { maxQuantity, metadata, price } = blueprintFixtures[i]
    // IDs start at 1
    const blueprintId = i + 1

    // Create a new Blueprint, mint NFTs, and create sale
    await printBlueprint(maxQuantity, metadata, [Admin])

    await batchMintNFT(blueprintId, maxQuantity, Admin, [Admin])

    await createSaleOffer(Admin, blueprintId, toUFix64(price / 100))
  }
  console.log('Blueprints:', await getBlueprintsCount())

  const saleOffers = await getSaleOffers(Admin)

  // Get sale offer details
  const saleOfferId = saleOffers[0]
  const saleOffer = await getSaleOfferDetails(Admin, saleOfferId)
  console.log('Sale', saleOffer)

  console.log(getAddressMap())

  await emulator.waitForClose()
}

try {
  run()
} catch (e) {
  console.log('Flow dev error:', e)
}
