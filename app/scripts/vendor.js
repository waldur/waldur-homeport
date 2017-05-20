import 'font-awesome/css/font-awesome.css';
import 'leaflet/dist/leaflet.css';
import 'world-flags-sprite/stylesheets/flags16.css';
// jquery is passed by webpack.
import 'bootstrap/dist/css/bootstrap.css';
import '../static/css/style.css';
import $ from 'jquery';
// $ is required for datatables.net to work properly.
// Can be replaced with a providePlugin when slimscroll is migrated to webpack
import angular from 'angular';
window.gettext = angular.identity;
// bower dependant
import '../static/js/jquery.slimscroll.min.js';
import '../static/js/angular/angular-slimscroll.js';
// end
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
import moment from 'moment';
window.moment = moment;
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
import 'angular-xeditable';
import 'angular-xeditable/dist/css/xeditable.css';
import 'angular-sanitize';
import 'leaflet';
import 'd3';
import 'angular-leaflet-directive';
import 'angular-ui-bootstrap';
import 'angular-ui-bootstrap/dist/ui-bootstrap-csp.css';
import 'angular-bind-html-compile-ci-dev';

import 'jszip';
import 'datatables.net';
import 'datatables.net-bs';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
import 'datatables.net-buttons';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-buttons-bs';
import 'datatables.net-buttons-bs/css/buttons.bootstrap.css';
import 'datatables.net-responsive';
import 'datatables.net-responsive-bs';
import 'datatables.net-responsive-bs/css/responsive.bootstrap.css';
