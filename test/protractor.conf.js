exports.config = {
  directConnect: true,
  specs: [
    'internal/modeCostTracking/*.js',
    'internal/modeDevelop/*.js',
    'internal/modePrivateIaas/*.js',
    'internal/modePublicBrokerage/*.js',
    'internal/modeSquStudentCloud/*.js'
  ],
  suites: {
    costTracking: 'internal/modeCostTracking/*.js',
    develop: 'internal/modeDevelop/*.js',
    privateIaas: 'internal/modePrivateIaas/*.js',
    publicBrokerage: 'internal/modePublicBrokerage/*.js',
    squStudentCloud: 'internal/modeSquStudentCloud/*.js'
  },
  capabilities: {
      browserName: 'chrome'
  },

  // tunings for tests to run in docker environment
  framework: 'jasmine2',
  maxSessions: 1,
  jasmineNodeOpts: {
  // Default time to wait in ms before a test fails.
    defaultTimeoutInterval: 60000
  }

};
