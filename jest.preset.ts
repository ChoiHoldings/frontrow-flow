const nxPreset = require('@nrwl/jest/preset')

module.exports = {
  ...nxPreset,
  restoreMocks: true,
  resetMocks: true,
}
