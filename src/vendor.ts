import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'angular';
import moment from 'moment-timezone';
require('moment/locale/ar');
require('moment/locale/az');
require('moment/locale/en-gb');
require('moment/locale/et');
require('moment/locale/fi');
require('moment/locale/lt');
require('moment/locale/lv');
require('moment/locale/ru');
require('moment/locale/uk');
moment.locale('en-gb');

window['moment'] = moment;

import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/assets/css/leaflet.css';

import 'font-awesome/css/font-awesome.css';
import 'world-flags-sprite/stylesheets/flags16.css';
import 'npm-font-open-sans';
import 'bootstrap/dist/css/bootstrap.css';

import 'angular-animate';
import 'angular-cookies';
import 'angular-loader';
import 'angulartics';
import 'angulartics-google-analytics';
import 'ui-select';
import 'ui-select/dist/select.css';
import 'angular-translate';
import 'angular-translate-storage-cookie';
import 'angular-translate-storage-local';
import 'angular-translate-loader-static-files';
import 'angular-sanitize';
import 'angular-ui-bootstrap';
import 'angular-ui-bootstrap/dist/ui-bootstrap-csp.css';
import 'angular-bind-html-compile-ci-dev';

// if (process.env.NODE_ENV === 'production') {
//   require('offline-plugin/runtime').install(); // eslint-disable-line global-require
// }
