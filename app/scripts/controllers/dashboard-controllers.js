'use strict';

(function() {
  angular.module('ncsaas').service('DashboardChartService', DashboardChartService);

  DashboardChartService.$inject = ['$q', 'priceEstimationService', 'quotasService', '$filter', 'ENV'];
  function DashboardChartService($q, priceEstimationService, quotasService, $filter, ENV) {
    var vm = this;
    // Each chart should have equal number of data points
    // Each sparkline chart bar has width equal to 4% so 25 by 4 points
    var POINTS_COUNT = 25;

    this.getOrganizationCharts = function(organization) {
      var quotas = this.getDashboardQuotas(ENV.organizationDashboardQuotas);
      return $q.all([
        this.getCostChart(organization),
        this.getResourceHistoryCharts(quotas, organization)
      ]).then(function(charts) {
        return [charts[0]].concat(charts[1]);
      });
    };

    this.getProjectCharts = function(project) {
      var quotas = this.getDashboardQuotas(ENV.projectDashboardQuotas);
      return this.getResourceHistoryCharts(quotas, project);
    };

    this.getDashboardQuotas = function(items) {
      return items.map(function(quota) {
        return angular.extend({quota: quota}, ENV.dashboardQuotas[quota]);
      });
    };

    this.getResourceHistoryCharts = function(charts, scope) {
      charts = charts.filter(function(chart) {
        return !chart.feature || (ENV.featuresVisible || ENV.toBeFeatures.indexOf(chart.feature) == -1);
      });

      var quotaMap = scope.quotas.reduce(function(map, quota) {
        map[quota.name] = quota;
        return map;
      }, {});

      var validCharts = charts.filter(function(chart) {
        return !!quotaMap[chart.quota];
      });

      var promises = validCharts.map(function(chart) {
        chart.quota = quotaMap[chart.quota];
        chart.current = chart.quota.usage;
        return vm.getQuotaHistory(chart.quota.url).then(function(data) {
          chart.data = data;
        });
      });

      return $q.all(promises).then(function() {
        angular.forEach(validCharts, function(chart) {
          if (chart.data && chart.data.length > 1) {
            chart.change = vm.getRelativeChange([
              chart.data[chart.data.length - 1].value,
              chart.data[chart.data.length - 2].value
            ]);
          }
        });
        return validCharts;
      });
    };
    this.getQuotaHistory = function(url) {
      var end = moment.utc().unix();
      var start = moment.utc().subtract(1, 'month').unix();

      return quotasService.getHistory(url, start, end, POINTS_COUNT).then(function(items) {
        items = items.filter(function(item) {
          return !!item.object;
        }).map(function(item) {
          return {
            date: moment.unix(item.point).toDate(),
            value: item.object.usage
          };
        });

        items = vm.padMissingValues(items);

        return items.map(function(item) {
          item.label = item.value + ' at ' + $filter('date', 'yyyy-MM-dd')(item.date);
          return item;
        });
      });
    };
    this.getCostChart = function(scope) {
      return priceEstimationService.getList({
        scope: scope.url
      }).then(function(estimates) {
        estimates = estimates.map(function(estimate) {
          return {
            value: estimate.total,
            date: new Date(estimate.year, estimate.month - 1, 1)
          }
        });

        estimates.reverse();
        estimates = vm.padMissingValues(estimates, 'month');
        estimates = estimates.map(function(estimate) {
          estimate.label = $filter('defaultCurrency')(estimate.value) +  ' at ' +
                           $filter('date', 'yyyy-MM')(estimate.date);
          return estimate;
        });
        return {
          title: 'Total cost',
          data: estimates,
          current: $filter('defaultCurrency')(estimates[estimates.length - 1].value),
          change: vm.getRelativeChange([
            estimates[estimates.length - 1].value,
            estimates[estimates.length - 2].value
          ])
        };
      });
    };
    this.padMissingValues = function(items, interval) {
      var i = 1, end = moment();
      if (items.length > 0) {
        end = moment(items[items.length - 1].date);
      }
      while(items.length != POINTS_COUNT) {
        items.unshift({
          value: 0,
          date: new Date(end.subtract(i, interval).toDate())
        });
      }
      return items;
    };
    this.getRelativeChange = function(items) {
      if (items.length < 2) {
        return null;
      }
      // Latest values come first
      var last = items[0];
      var prev = items[1];
      var change = Math.round(100 * (last - prev) / prev);
      return Math.min(100, Math.max(-100, change));
    };
  }
})();


(function() {
  angular.module('ncsaas')
    .controller('OrganizationDashboardController', OrganizationDashboardController);

  OrganizationDashboardController.$inject = [
    'currentStateService', 'DashboardChartService', '$scope', '$q'
  ];
  function OrganizationDashboardController(
    currentStateService, DashboardChartService, $scope, $q
  ) {
    var vm = this;
    vm.loading = true;

    activate();
    $scope.$on('currentCustomerUpdated', function() {
      activate();
    });

    function activate() {
      vm.loading = true;
      return currentStateService.getCustomer().then(function(customer) {
        return DashboardChartService.getOrganizationCharts(customer).then(function(charts) {
          vm.charts = charts;
        }).finally(function() {
          vm.loading = false;
        });
      });
    }
  }
})();


(function() {
  angular.module('ncsaas').service('DashboardFeedService', DashboardFeedService);

  DashboardFeedService.$inject = ['alertsService', 'eventsService', 'alertFormatter', 'eventFormatter'];
  function DashboardFeedService(alertsService, eventsService, alertFormatter, eventFormatter) {
    var vm = this;

    this.getProjectAlerts = function(project) {
      return alertsService.getList({
        aggregate: 'project',
        uuid: project.uuid
      }).then(function(alerts) {
        return alerts.map(function(alert) {
          alert.html_message = alertFormatter.format(alert);
          return alert;
        });
      });
    };

    this.getProjectEvents = function(project) {
      return eventsService.getList({scope: project.url}).then(function(events) {
        return events.map(function(event) {
          event.html_message = eventFormatter.format(event);
          event.created = event['@timestamp'];
          return event;
        });
      });
    };
  }
})();


(function() {
  angular.module('ncsaas')
    .controller('ProjectDashboardController', ProjectDashboardController);

  ProjectDashboardController.$inject = [
    'currentStateService', 'DashboardChartService', '$scope'
  ];
  function ProjectDashboardController(
    currentStateService, DashboardChartService, $scope
  ) {
    var vm = this;

    activate();
    $scope.$on('currentProjectUpdated', function() {
      activate();
    });

    function activate() {
      vm.loading = true;
      currentStateService.getProject().then(function(project) {
        vm.project = project;
        return DashboardChartService.getProjectCharts(project).then(function(charts) {
          vm.charts = charts;
        });
      }).finally(function() {
        vm.loading = false;
      });
    }
  }
})();
