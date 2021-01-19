module.exports = {
  transform: {
    '^.+\\.(tsx?|jsx?)$': 'ts-jest',
    '^.+\\.svg$': '<rootDir>/test/svgTransform.js',
    '^.+\\.png$': '<rootDir>/test/pngTransform.js',
  },
  testRegex: '\\.spec\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '@waldur/(.*)': '<rootDir>/src/$1',
    '\\.(css|scss|svg)$': '<rootDir>/test/style-mock.js',
  },
  setupFiles: ['<rootDir>/test/enzyme-setup.js', 'jest-date-mock'],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/cypress/'],
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [151001],
      },
    },
  },
  snapshotSerializers: ['enzyme-to-json/serializer'],
};
