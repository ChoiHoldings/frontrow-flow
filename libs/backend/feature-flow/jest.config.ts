module.exports = {
  displayName: 'backend-feature-flow',
  preset: '../../../jest.preset.ts',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../../coverage/libs/backend/feature-flow',
}
