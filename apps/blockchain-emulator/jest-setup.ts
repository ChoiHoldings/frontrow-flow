import _ from 'lodash'
import { expect } from '@jest/globals'
import { CadenceEvent, CadenceResult } from '@samatech/onflow-fcl-esm'
import { ICadenceEventByType } from '@ismedia/shared/type-blockchain-event'

const eventMatches = (
  event: CadenceEvent | ICadenceEventByType,
  events: CadenceEvent[],
): string | null => {
  const expectedData = event.data
  for (const e of events) {
    if (e.type.includes(event.type)) {
      if (expectedData) {
        const dataMatch = _.isEqual(expectedData, e.data)
        if (!dataMatch) {
          const dataJson = JSON.stringify(e.data, null, 2)
          const expectJson = JSON.stringify(expectedData, null, 2)
          return `Event data for ${event.type} doesn't match ${dataJson}\nshould be: ${expectJson}`
        }
      }
      return null
    }
  }
  return `Event ${event.type} not found`
}

expect.extend({
  toEmit(
    received: CadenceResult,
    expected: string | CadenceEvent | CadenceEvent[],
  ): jest.CustomMatcherResult {
    let events: CadenceEvent[] | ICadenceEventByType[]
    if (typeof expected === 'string') {
      events = [{ type: expected }]
    } else {
      events = Array.isArray(expected) ? expected : [expected]
    }

    for (const event of events) {
      const error = eventMatches(event, received.events || [])
      if (error) {
        return {
          pass: false,
          message: () => error,
        }
      }
    }
    return {
      pass: true,
      message: () => '',
    }
  },
})
