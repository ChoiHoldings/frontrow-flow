import { Injectable, Logger } from '@nestjs/common'
import {
  Emulator,
  IFlowAccount,
  getAddressMap,
  toUFix64,
  deployFusd,
  mintFusdToAccount,
  setupFusdOnAccount,
} from '@samatech/onflow-ts'
import {
  AccountManager,
  getBlueprintsCount,
  setupFrontRowCollectionOnAccount,
  getSaleOfferDetails,
  getSaleOffers,
  printBlueprintCreateSaleOffer,
  buyNFT,
  deployNftStorefront,
  createNftListing,
} from '@ismedia/backend/feature-flow'
import { testSetup } from './common'
import { mintFlow } from './flow'
import { blueprintFixtures } from './emulator.fixtures'

@Injectable()
export class EmulatorService {
  private emulator: Emulator
  private accounts: AccountManager
  private EmulatorAccount: IFlowAccount
  private AdminAccount: IFlowAccount

  constructor() {
    this.accounts = new AccountManager()
  }

  // Mint Flow and FUSD to an account
  async prepareAccount(account: IFlowAccount) {
    await mintFlow(this.EmulatorAccount, account, toUFix64(100.0))
    await setupFusdOnAccount(account)
    await mintFusdToAccount(this.AdminAccount, account, 1000)
  }

  async init() {
    this.emulator = await testSetup(7000)
    try {
      await this.seed()
    } catch (e) {
      Logger.error('Emulator failed to start ' + e)
    }
  }

  async seed() {
    this.EmulatorAccount = this.accounts.register('accounts/emulator-account')
    this.AdminAccount = await this.accounts.create(
      this.EmulatorAccount,
      'accounts/development-account-admin',
    )
    // TODO -- better way to create account with correct address?
    // This is used so the dev account address doesn't overlap with testing accounts
    await this.accounts.create(this.EmulatorAccount, 'accounts/development-account')
    const DevTest = await this.accounts.create(
      this.EmulatorAccount,
      'accounts/development-test-account',
    )
    const Dev = await this.accounts.create(
      this.EmulatorAccount,
      'accounts/development-account',
    )
    await mintFlow(this.EmulatorAccount, this.AdminAccount, toUFix64(100.0))

    await deployFusd(this.AdminAccount)
    await deployNftStorefront(this.AdminAccount)
    await this.prepareAccount(this.AdminAccount)
    await setupFrontRowCollectionOnAccount(this.AdminAccount)
    await this.prepareAccount(Dev)
    await setupFrontRowCollectionOnAccount(Dev)
    await this.prepareAccount(DevTest)

    for (let i = 0; i < blueprintFixtures.length; i += 1) {
      const { maxQuantity, metadata, price } = blueprintFixtures[i]

      // Create a new Blueprint and create sale
      await printBlueprintCreateSaleOffer(this.AdminAccount, maxQuantity, metadata, price)
    }
    console.log('Blueprints:', await getBlueprintsCount())

    const saleOffers = await getSaleOffers(this.AdminAccount)

    // Get sale offer details
    const saleOfferId = saleOffers[0]
    const saleOffer = await getSaleOfferDetails(this.AdminAccount, saleOfferId)
    console.log('Sale', saleOffer)

    // Make purchases to match test fixtures
    await buyNFT(DevTest, 3)

    // Make purchases to match dev fixtures
    await buyNFT(Dev, 2)
    await buyNFT(Dev, 2)
    // FIX: buy with the correct user account (user id 1461fc3c-21c0-4fa9-9f96-b3c59c144922)
    await buyNFT(this.AdminAccount, 2)
    await buyNFT(Dev, 2)

    // Create a $100 Nft sale listing for NFT ID = 3
    await createNftListing(Dev, 3, 100)

    console.log(getAddressMap())
  }

  async resetEmulator() {
    await this.emulator.stop()
    await this.emulator.start()
    await this.seed()
  }
}
