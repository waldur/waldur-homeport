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

import './shims';

import 'font-awesome/css/font-awesome.css';
import 'world-flags-sprite/stylesheets/flags16.css';
import 'npm-font-open-sans';
import 'bootstrap/dist/css/bootstrap.css';

import 'angular-cron-jobs';
import 'angular-cron-jobs/dist/angular-cron-jobs.css';
import 'angular-animate';
import 'angular-cookies';
import 'angular-loader';
import 'angular-flash-alert';
import 'angular-flash-alert/dist/angular-flash.css';
import 'angulartics';
import 'angulartics-google-analytics';
import 'angular-resource';
import 'ui-select';
import 'ui-select/dist/select.css';
import 'satellizer';
import 'angular-translate';
import 'angular-translate-storage-cookie';
import 'angular-translate-storage-local';
import 'angular-translate-loader-static-files';
import 'angular-sanitize';
import 'angular-ui-bootstrap';
import 'angular-ui-bootstrap/dist/ui-bootstrap-csp.css';
import 'angular-bind-html-compile-ci-dev';
import 'intro.js';
import 'intro.js/introjs.css';
import 'angular-intro.js';

import 'react-select/dist/react-select.css';

// if (process.env.NODE_ENV === 'production') {
//   require('offline-plugin/runtime').install(); // eslint-disable-line global-require
// }
