import template from './resource-analysis.html';
import './resource-analysis.scss';

export default function resourceAnalysis() {
  return {
    restrict: 'E',
    template: template,
    controller: ResourceAnalysisController,
    controllerAs: 'DashboardController',
    scope: {},
  };
}

// @ngInject
function ResourceAnalysisController(
    baseControllerClass,
    projectsService,
    currentStateService,
    priceEstimationService,
    ncUtils,
    ENV,
    $q,
    $filter) {
  var controllerScope = this;
  var Controller = baseControllerClass.extend({
    showGraph: true,
    currentCustomer: null,
    init:function() {
      this.controllerScope = controllerScope;
      this.cacheTime = ENV.dashboardEventsCacheTime;
      this._super();
      this.activeTab = 'resources';
      this.barChartTab = 'vmsByProject';
      this.activate();
      this.currentMonth = new Date().getMonth() + 1;
      this.currentYear = new Date().getFullYear();
    },
    activate: function() {
      var vm = this;
      var projectPromise = projectsService.getList().then(function(projects) {
        vm.projectsList = projects;
        return projects;
      });
      var quotasPromise = projectPromise.then(function(projects) {
        return vm.getProjectsQuotas(projects).then(function(quotas) {
          vm.formatProjectQuotas(quotas);
        });
      });
      var barChartPromise = quotasPromise.then(function() {
        vm.projectsList.showBarChart = true;
        vm.setResourcesByProjectChartData();
      });
      var monthChartPromise = quotasPromise.then(function() {
        vm.setMonthCostChartData();
      });
      ncUtils.blockElement('bar-chart', barChartPromise);
      ncUtils.blockElement('month-cost-charts', monthChartPromise);
      ncUtils.blockElement('pie-charts', this.setCurrentUsageChartData());
    },
    getProjectsQuotas: function(projects) {
      // TODO: replace with data from relevant endpoint when ready
      var factory = projectsService.getFactory(false, '/stats/quota/');
      var promises = projects.map(function(project) {
        var query = {
          aggregate: 'project',
          uuid: project.uuid,
          quota_name: ['vcpu', 'ram', 'storage']
        };
        return factory.get(query).$promise.then(function(quotas) {
          quotas.project = project;
          return quotas;
        });
      });
      return $q.all(promises);
    },
    formatProjectQuotas: function(quotas) {
      quotas.forEach(function(quota) {
        var project = quota.project;
        project.vcpu = quota.vcpu_usage;
        project.ram = $filter('filesize')(quota.ram_usage);
        project.storage = $filter('filesize')(quota.storage_usage);
      });
    },
    setCurrentUsageChartData: function() {
      var vm = this;
      return currentStateService.getCustomer().then(function(response) {
        vm.currentCustomer = response;
        vm.currentPlan = response.plan && response.plan.name;
        vm.resourcesLimit = null;
        vm.resourcesUsage = null;

        vm.currentUsageData = {
          chartType: 'vms',
          chartWidth: 500,
          legendDescription: null,
          legendLink: 'plans',
          data: []
        };
        var freeResources = null;
        response.quotas.forEach(function(item) {
          if (item.name === 'nc_resource_count') {
            var limit;
            if (item.limit !== -1) {
              var free = item.limit - item.usage;
              limit = item.limit;
              freeResources = {
                label: free + ' free',
                count: free,
                name: 'plans'
              };
              vm.currentUsageData.legendDescription = item.usage + ' used / ' + limit + ' total';
            } else {
              vm.currentUsageData.legendDescription = item.usage + ' used';
              limit = 'unlimited';
            }
            vm.resourcesLimit = limit;
            vm.resourcesUsage = item.usage;
          }
          if (item.name === 'nc_vm_count') {
            var vms = item.usage;
            vm.currentUsageData.data.push({ label: vms + ' VMs', count: vms, name: 'vms' });
          }
          if (item.name === 'nc_app_count') {
            var apps = item.usage;
            vm.currentUsageData.data.push({ label: apps + ' applications', count: apps, name: 'apps' });
          }
          if (item.name === 'nc_private_cloud_count') {
            var pcs = item.usage;
            vm.currentUsageData.data.push({ label: pcs + ' private clouds', count: pcs, name: 'private clouds' });
          }
        });
        vm.currentUsageData.data = ncUtils.sortArrayOfObjects(vm.currentUsageData.data, 'name', 0);
        freeResources && vm.currentUsageData.data.push(freeResources);
      });
    },
    setMonthCostChartData: function() {
      var vm = this;
      priceEstimationService.pageSize = 100;
      return priceEstimationService.getAll().then(function(rows) {
        vm.priceEstimationRows = rows;
        vm.monthCostChartData = {
          chartType: 'services',
          chartWidth: 200,
          legendDescription: null,
          legendLink: 'providers',
          data: []
        };
        vm.totalMonthCost = 0;
        rows.forEach(function(item) {
          if (item.scope_type === 'service'
              && (vm.currentYear === item.year && vm.currentMonth === item.month)
              && vm.monthCostChartData.data.length < 5
              && item.total > 0) {
            var truncatedName = ncUtils.truncateTo(item.scope_name, 8);
            var inData = false;
            for (var i = 0; i < vm.monthCostChartData.data.length; i++) {
              if (vm.monthCostChartData.data[i].itemName === item.scope_name) {
                inData = true;
              }
            }
            !inData && vm.monthCostChartData.data.push({
              label: truncatedName + ' ('+ ENV.currency + item.total.toFixed(2) +')',
              fullLabel: item.scope_name + ' ('+ ENV.currency + item.total.toFixed(2) +')',
              count: item.total,
              itemName: item.scope_name,
              name: 'providers' });
            !inData && (vm.totalMonthCost += item.total);
          }
          vm.monthCostChartData.legendDescription = 'Projected cost: ' + ENV.currency + vm.totalMonthCost.toFixed(2);
        });
        vm.monthCostChartData.data = ncUtils.sortArrayOfObjects(vm.monthCostChartData.data, 'count', 1);
        vm.setServicesByProjectChartData();
      });
    },
    setServicesByProjectChartData: function() {
      var vm = this;
      vm.servicesByProjectChartData = {
        data :[],
        projects: vm.projectsList,
        chartType: 'services'
      };
      vm.priceEstimationRows.forEach(function(priceRow) {
        if (priceRow.scope_type === 'service'
            && (vm.currentYear === priceRow.year && vm.currentMonth === priceRow.month)
            && vm.servicesByProjectChartData.data.length < 5) {
          var inData = false;
          for (var i = 0; i < vm.servicesByProjectChartData.data.length; i++) {
            if (vm.servicesByProjectChartData.data[i].name === priceRow.scope_name) {
              inData = true;
            }
          }
          !inData && priceRow.total > 0 && vm.servicesByProjectChartData.data.push({data: [], name: priceRow.scope_name, total: priceRow.total});
          vm.projectsList.forEach(function(project) {
            var projectPrice = 0;
            vm.priceEstimationRows.forEach(function(innerPriceRow) {
              if (innerPriceRow.scope_type === 'serviceprojectlink'
                  && (vm.currentYear === innerPriceRow.year && vm.currentMonth === innerPriceRow.month)
                  && innerPriceRow.scope_name.indexOf(priceRow.scope_name) !== -1
                  && innerPriceRow.scope_name.indexOf(project.name) !== -1) {
                projectPrice += innerPriceRow.total;
              }
            });
            var lastElem = vm.servicesByProjectChartData.data.length -1;
            (lastElem > -1)
              && vm.servicesByProjectChartData.data[lastElem].data.push({project: project.uuid, count: parseFloat(projectPrice.toFixed(2))});
          });
        }
      });
      vm.servicesByProjectChartData.data = ncUtils.sortArrayOfObjects(vm.servicesByProjectChartData.data, 'total', 1);
    },
    setResourcesByProjectChartData: function() {
      var vm = this;
      vm.resourcesByProjectChartData = {
        data :[{data: [], name: 'Applications'}, {data: [], name: 'Private clouds'}, {data: [], name: 'VMs'}],
        projects: vm.projectsList,
        chartType: 'resources'
      };
      vm.resourcesCount = 0;
      vm.projectsList.forEach(function(item) {
        item.quotas.forEach(function(itemQuota) {
          if (itemQuota.name === 'nc_vm_count') {
            vm.resourcesByProjectChartData.data[2].data.push({project: item.uuid, count: itemQuota.usage});
            vm.resourcesCount += itemQuota.usage;
          }
          if (itemQuota.name === 'nc_app_count') {
            vm.resourcesByProjectChartData.data[0].data.push({project: item.uuid, count: itemQuota.usage});
            vm.resourcesCount += itemQuota.usage;
          }
          if (itemQuota.name === 'nc_private_cloud_count') {
            vm.resourcesByProjectChartData.data[1].data.push({project: item.uuid, count: itemQuota.usage});
            vm.resourcesCount += itemQuota.usage;            }

        });
      });
    },
    changeTab: function(tabName) {
      this.barChartTab = this.totalMonthCost ? tabName : this.barChartTab;
      return false;
    }
  });

  controllerScope.__proto__ = new Controller();
}
