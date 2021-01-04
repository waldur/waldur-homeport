import 'core-js/stable';
import 'regenerator-runtime/runtime';

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

import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/assets/css/leaflet.css';

import 'font-awesome/css/font-awesome.css';
import 'npm-font-open-sans';
import 'bootstrap/dist/css/bootstrap.css';

// if (process.env.NODE_ENV === 'production') {
//   require('offline-plugin/runtime').install(); // eslint-disable-line global-require
// }
