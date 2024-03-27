module.exports = {
  transform: {
    '^.+\\.(tsx?|jsx?)$': [
      'ts-jest',
      {
        diagnostics: {
          ignoreCodes: [151001],
        },
      },
    ],
    '^.+\\.svg$': '<rootDir>/test/svgTransform.js',
    '^.+\\.png$': '<rootDir>/test/pngTransform.js',
  },
  transformIgnorePatterns: ['node_modules/(?!axios/.*)'],
  testRegex: '\\.spec\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '@waldur/(.*)': '<rootDir>/src/$1',
    '\\.(css|scss|svg)$': '<rootDir>/test/style-mock.js',
  },
  setupFiles: [
    '<rootDir>/test/enzyme-setup.js',
    '<rootDir>/test/react-setup.js',
    'jest-date-mock',
    'mock-match-media/jest-setup',
  ],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/cypress/'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  coverageReporters: ['cobertura'],
  testEnvironment: 'jsdom',
  reporters: ['default', 'jest-junit'],
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
};
