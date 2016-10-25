import sparkline from './components/sparkline/sparkline.js';
import visibleIf from './components/visibleIf/visibleIf.js';

const module = angular.module('ncsaas');

module.directive('sparkline', sparkline);
module.directive('visibleIf', visibleIf);
