// require all modules ending in "_test" from the
// scripts directory and all subdirectories
// eslint-disable-next-line no-undef
window.gettext = angular.identity;

const testsContext = require.context('../src', true, /\.spec\.js$/);
testsContext.keys().forEach(testsContext);
