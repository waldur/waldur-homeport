exports.config = {
  directConnect: true,
  specs: [
    'internal/modeDevelop/*.js',
    'internal/modePublicBrokerage/*.js',
  ],
  suites: {
    develop: 'internal/modeDevelop/*.js',
    publicBrokerage: 'internal/modePublicBrokerage/*.js',
  },
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: ['--no-sandbox', '--test-type=browser']
    }
  },

  // tunings for tests to run in docker environment
  framework: 'jasmine2',
  maxSessions: 1,
  jasmineNodeOpts: {
  // Default time to wait in ms before a test fails.
    defaultTimeoutInterval: 60000
  }

};

if (process.env.BROWSER === 'firefox') {
  exports.config.capabilities.browserName = 'firefox';
}
