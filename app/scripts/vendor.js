import 'babel-polyfill';

import $ from 'jquery';
import angular from 'angular';
import moment from 'moment';
window.moment = moment;

import './shims';

import 'font-awesome/css/font-awesome.css';
import 'world-flags-sprite/stylesheets/flags16.css';
import 'npm-font-open-sans';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/tooltip';
import 'bootstrap/js/modal';
import 'bootstrap/js/dropdown';

import 'angular-cron-jobs';
import 'angular-cron-jobs/dist/angular-cron-jobs.css';
import 'angular-animate';
import 'angular-block-ui';
import 'angular-block-ui/dist/angular-block-ui.css';
import 'angular-cookies';
import 'angular-loader';
import 'angular-gravatar';
import 'angular-flash-alert';
import 'angular-flash-alert/dist/angular-flash.css';
import 'angulartics';
import 'angulartics-google-analytics';
import 'angular-moment';
import 'angular-resource';
import 'angular-scroll';
import 'angular-ui-router';
import 'ui-select';
import 'ui-select/dist/select.css';
import 'satellizer';
import 'angular-translate';
import 'angular-translate-storage-cookie';
import 'angular-translate-storage-local';
import 'angular-translate-loader-static-files';
import 'ng-file-upload';
import 'angular-sanitize';
import 'angular-ui-bootstrap';
import 'angular-ui-bootstrap/dist/ui-bootstrap-csp.css';
import 'angular-bind-html-compile-ci-dev';
import 'oclazyload';
import 'intro.js';
import 'intro.js/introjs.css';
import 'angular-intro.js';

import 'summernote/dist/summernote.css';
import 'summernote/dist/summernote';
import 'angular-summernote/dist/angular-summernote';

if (process.env.NODE_ENV === 'production') {
  require('offline-plugin/runtime').install(); // eslint-disable-line global-require
}
