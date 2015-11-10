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

            if (customer.plan) {
              scope.currentPlan = customer.plan.name;

              var usage = {};
              for (var i = 0; i < customer.quotas.length; i++) {
                var quota = customer.quotas[i];
                usage[quota.name] = quota.usage;
              }

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
                  name: name + (quota.value > 1 || quota.value == -1 ? 's' : ''),
                  limit: quota.limit < 0 ? '∞' : quota.limit,
                  usage: quota.usage
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
