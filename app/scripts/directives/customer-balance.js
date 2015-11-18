'use strict';

(function() {
  angular.module('ncsaas')
    .directive('customerBalance', ['currentStateService', 'ncUtils', 'ENV', detailsView]);

  function detailsView(currentStateService, ncUtils, ENV) {
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
            var usage = ncUtils.getQuotaUsage(customer.quotas);

            if (customer.plan) {
              scope.currentPlan = customer.plan.name;
              scope.currentPlanQuotas = customer.plan.quotas.map(function(quota) {
                var name = ncUtils.getPrettyQuotaName(quota.name);
                return {
                  name: name + (quota.value > 1 || quota.value == -1 ? 's' : ''),
                  limit: quota.value < 0 ? '∞' : quota.value,
                  usage: usage[quota.name]
                };
              });
            } else {
              scope.currentPlan = 'Default';
              scope.currentPlanQuotas = customer.quotas.map(function(quota) {
                var name = ncUtils.getPrettyQuotaName(quota.name);
                return {
                  name: name + (quota.limit > 1 || quota.limit == -1 ? 's' : ''),
                  limit: quota.limit < 0 ? '∞' : quota.limit,
                  usage: usage[quota.name]
                };
              });
            }
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
