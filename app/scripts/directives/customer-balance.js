'use strict';

(function() {
  angular.module('ncsaas')
    .directive('customerBalance', ['currentStateService', detailsView]);

  function detailsView(currentStateService) {
    return {
      restrict: 'E',
      templateUrl: "views/directives/customer-balance.html",
      replace: true,
      scope: {
        type: '@customerBalanceType'
      },
      link: function(scope) {
        scope.chartData = {
          labels: ["Monday", "Tuesday", "Wednsday", "Thursday", "Friday", "Saturday", "Sunday"],
          datasets: [
            {
              label: "Events",
              fillColor: "rgba(220,220,220,0.2)",
              strokeColor: "rgba(220,220,220,1)",
              pointColor: "rgba(220,220,220,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: [65, 59, 80, 81, 56, 55, 40]
            }
          ]
        };
        scope.chartOptions = {
          responsive: true,
          scaleShowGridLines : false
        };

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
