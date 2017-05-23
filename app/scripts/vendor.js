import 'font-awesome/css/font-awesome.css';
// leaflet does not load images correctly.
// see more details:
// https://github.com/PaulLeCam/react-leaflet/issues/255
// https://github.com/Leaflet/Leaflet/issues/4968
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// remove to avoid 414 error.
delete L.Icon.Default.prototype._getIconUrl;
// load missing images
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-shadow.png';

// register images
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'static/images/marker-icon-2x.png',
    iconUrl: 'static/images/marker-icon.png',
    shadowUrl: 'static/images/marker-shadow.png',
});

import 'world-flags-sprite/stylesheets/flags16.css';
import 'html5shiv';
import 'npm-font-open-sans';
// jquery is passed by webpack.
import 'bootstrap/dist/css/bootstrap.css';
import $ from 'jquery';
// $ is required for datatables.net to work properly.
// Can be replaced with a providePlugin when slimscroll is migrated to webpack
import angular from 'angular';
window.gettext = angular.identity;
require('!script!../../bower_components/slimScroll/jquery.slimscroll.js');
import '../../bower_components/angular-slimscroll/angular-slimscroll.js';
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
