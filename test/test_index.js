// require all modules ending in "_test" from the
// scripts directory and all subdirectories
// eslint-disable-next-line no-undef
window.gettext = angular.identity;

const testsContext = require.context('../app/scripts', true, /\.spec\.js$/);
testsContext.keys().forEach(testsContext);
