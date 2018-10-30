module.exports = {
  transform: {
    '^.+\\.(tsx?|jsx?)$': 'ts-jest'
  },
  testRegex: '\\.spec\\.tsx?$',
  moduleFileExtensions: ['ts','tsx','js','jsx','json'],
  moduleNameMapper: {
    '@waldur/(.*)': '<rootDir>/src/$1',
    '\\.(css|scss|svg)$': '<rootDir>/test/style-mock.js'
  },
  setupFiles: ['<rootDir>/test/enzyme-setup.js', 'jest-date-mock'],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/'],
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [151001]
      }
    }
  }
};
