module.exports = {
  transform: {
    '^.+\\.(tsx?|jsx?)$': '<rootDir>/node_modules/ts-jest/preprocessor.js'
  },
  testRegex: '\\.spec\\.tsx?$',
  moduleFileExtensions: ['ts','tsx','js','jsx','json'],
  moduleNameMapper: {
    '@waldur/(.*)': '<rootDir>/src/$1',
    '\\.(css|scss|svg)$': '<rootDir>/test/style-mock.js'
  },
  setupFiles: ['<rootDir>/test/enzyme-setup.js', 'jest-date-mock'],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/']
};
