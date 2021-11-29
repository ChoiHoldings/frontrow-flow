import { InteractionType } from '../lib/interactions'

// Config for all tests
export const TEST_CONFIG = {
  BASE_PATH: './libs/shared/data-access-flow/src/lib/frontrow',
  PORT: 7002,
  CDC_DIRECTORIES: {
    [InteractionType.CONTRACT]: './contracts/',
    [InteractionType.TRANSACTION]: './transactions/',
    [InteractionType.SCRIPT]: './scripts/',
  },
}
