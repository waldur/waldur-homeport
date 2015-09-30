'use strict';

(function() {
  angular.module('ncsaas')
    .directive('customerBalance', ['currentStateService', 'ENV', detailsView]);

  function detailsView(currentStateService, ENV) {
    return {
      restrict: 'E',
      templateUrl: "views/directives/customer-balance.html",
      replace: true,
      scope: {
        type: '@customerBalanceType',
        addCredit: '=customerAddCredit',
        chartData: '=customerChartData',
        showChart: '=customerShowChart',
      },
      link: function(scope) {
        scope.chartOptions = {
          responsive: true,
          scaleShowGridLines : false
        };

        scope.currency = ENV.currency;

        currentStateService.getCustomer().then(function(response) {
          scope.model = response;
          scope.currentPlan = response.plan ? response.plan.name : 'Default';
          // XXX replace when backend will send proper quotas names
          var quotas = response.quotas;
          scope.currentPlanQuotas = quotas ? quotas.map(function(elem) {
            return {
              name: elem.name.replace(/nc_|_count/gi,'') + (elem.limit > 1 || elem.limit == -1 ? 's' : ''),
              limit: elem.limit < 0 ? '∞' : elem.limit,
              usage: elem.usage < 0 ? '∞' : elem.usage
            };
          }) : [];
        });
      }
    };
  }
})();
