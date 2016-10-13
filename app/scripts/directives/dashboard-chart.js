'use strict';

(function() {

  angular.module('ncsaas')
    .directive('dashboardChart', [dashboardChart]);

  function dashboardChart() {
    return {
      restrict: 'E',
      templateUrl: 'views/dashboard/chart.html',
      scope: {
        chart: '='
      }
    };
  }
})();
