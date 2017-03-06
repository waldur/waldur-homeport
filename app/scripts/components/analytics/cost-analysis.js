import template from './cost-analysis.html';
import './cost-analysis.scss';

export default function costAnalysis() {
  return {
    restrict: 'E',
    template: template,
    controller: CostAnalysisController,
    controllerAs: 'DashboardController',
    scope: {},
  };
}

// @ngInject
function CostAnalysisController(
  baseControllerClass,
  priceEstimationService,
  ENV,
  customersService,
  resourcesService) {
  var controllerScope = this;
  var EventController = baseControllerClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.activate();
      controllerScope.loading = true;

      this.checkQuotasResource = 'resource';
      this.checkQuotasProvider = 'service';

      var vm = this;
      customersService.isOwnerOrStaff().then(function(hasRole) {
        vm.showProviderButton = hasRole;
      });
    },

    activate: function() {
      var vm = this;
      priceEstimationService.cacheTime = 1000 * 60 * 10;
      priceEstimationService.pageSize = 1000;
      priceEstimationService.getList().then(function(rows) {
        vm.processChartData(rows);
        vm.processTableData(rows);
      });
    },

    selectRow: function(row) {
      row.selected = !row.selected;
      row.activeTab = (ENV.featuresVisible || ENV.toBeFeatures.indexOf('providers') === -1)
        ? 'services'
        : 'projects';
      if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('resources') === -1) {
        this.getResourceDetails(row);
      }
    },

    getResourceDetails: function(row) {
      for (var i = 0; i < row.resources.length; i++) {
        var resource = row.resources[i];
        if (resource.scope && (!resource.resource_type || !resource.project_uuid)) {
          resourcesService.$get(null, null, resource.scope).then(function(response) {
            resource.resource_uuid = response.uuid;
            resource.resource_type = response.resource_type;
            resource.project_uuid = response.project_uuid;
            resource.project_name = response.project_name;
          });
        }
      }
    },

    processChartData: function(rows) {
      var result = {};
      rows.forEach(function(row) {
        if (['customer', 'service', 'project', 'resource'].indexOf(row.scope_type) >= 0) {
          var date = moment(row.month + ' ' + row.year, 'MM YYYY');
          var key = date.format('YYYYMM');

          if (!result[key]) {

            result[key] = {
              customer: [],
              service: [],
              project: [],
              resource: []
            };
          }

          result[key][row.scope_type].push({
            name: row.scope_name,
            value: row.total
          });

        }
      });
      controllerScope.loading = false;

      this.costData = result;
    },

    processTableData: function(rows) {
      var results = {},
        scopeArray,
        currentDate = new Date();
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var date = moment(row.month, 'MM').format('MMMM') + ' ' + row.year;
        if (!results.hasOwnProperty(date)) {
          results[date] = {
            total: 0,
            isCurrent: (currentDate.getFullYear() === row.year && row.month === currentDate.getMonth() + 1),
            projects: [],
            services: [],
            resources: []
          };
        }
        if (row.scope_type === 'customer') {
          results[date].total = row.total;
        }
        if (row.scope_type === 'project') {
          scopeArray = row.scope_name.split(' | ');
          row.project_name = scopeArray[0];
          row.organization_name = scopeArray[1];
          results[date].projects.push(row);
        }
        if (row.scope_type === 'resource') {
          results[date].resources.push(row);
        }
        if (row.scope_type === 'service') {
          results[date].services.push(row);
        }
      }
      var table = [];
      for (var key in results) {
        var val = results[key];
        table.push({
          date: key,
          total: val.total,
          projects: val.projects,
          services: val.services,
          resources: val.resources,
          isCurrent: val.isCurrent
        });
      }
      if (table.length > 0) {
        this.selectRow(table[0]);
      }
      this.table = table;
    }
  });

  controllerScope.__proto__ = new EventController();
}
