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
        showChart: '=customerShowChart'
      },
      link: function(scope) {
        var refresh = function() {

          scope.enablePurchaseCostDisplay = ENV.enablePurchaseCostDisplay;

          scope.currency = ENV.currency;
          scope.chartOptions = {
            responsive: true,
            bezierCurve: false,
            scaleShowGridLines: false
          };

          scope.currency = ENV.currency;

          scope.graphTooltip = false;

          scope.toggleChart = function() {
            scope.graphTooltip = !scope.graphTooltip;
            scope.amountTooltip = false;
            scope.quotasTooltip = false;
          };

          scope.toggleBalance = function() {
            scope.amountTooltip = !scope.amountTooltip;
            scope.graphTooltip = false;
            scope.quotasTooltip = false;
          };

          currentStateService.getCustomer().then(function(customer) {
            scope.model = customer;
            scope.currentPlan = customer.plan ? customer.plan.name : 'Default';
            // XXX replace when backend will send proper quotas names
            var quotas = customer.plan.quotas;

            var usage = {};
            for (var i = 0; i < customer.quotas.length; i++) {
              var item = customer.quotas[i];
              usage[item.name] = item.usage;
            }

            scope.currentPlanQuotas = quotas ? quotas.map(function(elem) {
              var name = elem.name.replace(/nc_|_count/gi,'');
              return {
                name: name + (elem.value > 1 || elem.value == -1 ? 's' : ''),
                limit: elem.value < 0 ? '∞' : elem.value,
                usage: usage[name] < 0 ? 0 : usage[name]
              };
            }) : [];
          });

        };

        refresh();
        scope.$on('customerBalance:refresh', function() {
          refresh();
        });

      }
    };
  }
})();
