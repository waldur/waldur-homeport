exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
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
  }
};
