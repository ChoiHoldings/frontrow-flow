import { jest, beforeEach, beforeAll, afterAll, it, describe } from '@jest/globals'
import { FlowAccount } from '@ismedia/shared/util-flow'
import { stopEmulator, testSetup } from '../src/lib/common'
import { AccountManager } from '../src/lib/accounts'
import { TEST_CONFIG } from '../src/utils/config'

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(15000)

//
const accounts = new AccountManager()
let Admin: FlowAccount

describe('FrontRow Contract', () => {
  beforeAll(async () => {
    await testSetup({
      port: 7002,
      basePath: TEST_CONFIG.BASE_PATH,
      cdcDirectories: TEST_CONFIG.CDC_DIRECTORIES,
    })
  })

  beforeEach(async () => {
    console.log(expect.getState().currentTestName)
  })

  // Stop emulator, so it could be restarted
  afterAll(async () => {
    await stopEmulator()
  })

  it('shall create an admin account', () => {
    Admin = accounts.register('accounts/emulator-account')
    expect(Admin).toBeTruthy()
  })

  it('shall create user accounts', async () => {
    const Eve = accounts.register('accounts/emulator-account-eve')
    const Frank = accounts.register('accounts/emulator-account-frank')

    expect(Eve).toBeTruthy()
    expect(Frank).toBeTruthy()

    expect(Eve).not.toEqual(Admin)
    expect(Frank).not.toEqual(Admin)
    expect(Eve).not.toEqual(Frank)
  })
})
