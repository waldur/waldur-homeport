import sparkline from './components/sparkline/sparkline.js';
import visibleIf from './components/visibleIf/visibleIf.js';
import userSelector from './components/userSelector/user-selector';

const module = angular.module('ncsaas');

module.directive('sparkline', sparkline);
module.directive('visibleIf', visibleIf);
module.directive('userSelector', userSelector);
