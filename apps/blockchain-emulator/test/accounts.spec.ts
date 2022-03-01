import { jest, beforeEach, beforeAll, afterAll, it, describe } from '@jest/globals'
import { AccountManager } from '@ismedia/backend/feature-flow'
import { stopEmulator, testSetup } from '@ismedia/backend/feature-blockchain-emulator'
import { IFlowAccount } from '@samatech/onflow-ts'

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(15000)

const accounts = new AccountManager()
let Admin: IFlowAccount

describe('FrontRow Contract', () => {
  beforeAll(async () => {
    await testSetup(7002)
  })

  beforeEach(() => {
    console.log(expect.getState().currentTestName)
  })

  // Stop emulator, so it could be restarted
  afterAll(async () => {
    await stopEmulator()
  })

  it('creates an admin account', () => {
    Admin = accounts.register('accounts/emulator-account')
    expect(Admin).toBeTruthy()
  })

  it('creates user accounts', async () => {
    const Eve = accounts.register('accounts/emulator-account-eve')
    const Frank = accounts.register('accounts/emulator-account-frank')

    expect(Eve).toBeTruthy()
    expect(Frank).toBeTruthy()

    expect(Eve).not.toEqual(Admin)
    expect(Frank).not.toEqual(Admin)
    expect(Eve).not.toEqual(Frank)
  })
})
