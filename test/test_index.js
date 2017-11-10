// require all modules ending in "_test" from the
// scripts directory and all subdirectories
// eslint-disable-next-line no-undef
window.gettext = angular.identity;

import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

var testsContext = require.context('../app/scripts', true, /\.spec$/);
testsContext.keys().forEach(testsContext);
