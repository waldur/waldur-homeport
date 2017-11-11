module.exports = {
  transform: {
    '^.+\\.(tsx?|jsx?)$': '<rootDir>/node_modules/ts-jest/preprocessor.js'
  },
  testRegex: '\\.spec\\.tsx?$',
  moduleFileExtensions: ['ts','tsx','js','jsx','json'],
  moduleNameMapper: {
    '@waldur/(.*)': '<rootDir>/app/scripts/components/$1',
    '\\.(css|scss)$': '<rootDir>/test/style-mock.js'
  },
  setupFiles: ['<rootDir>/test/enzyme-setup.js'],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/']
};
