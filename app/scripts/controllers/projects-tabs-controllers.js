(function() {
  angular.module('ncsaas')
    .controller('ProjectEventTabController', [
      '$stateParams',
      'projectsService',
      'baseEventListController',
      'currentStateService',
      ProjectEventTabController
    ]);

  function ProjectEventTabController($stateParams, projectsService, baseEventListController, currentStateService) {
    var controllerScope = this;
    var EventController = baseEventListController.extend({
      project: null,

      init: function() {
        this.controllerScope = controllerScope;
        this._super();
        this.getProject();
      },
      getList: function(filter) {
        if (this.project) {
          this.service.defaultFilter.scope = this.project.url;
          return this._super(filter);
        } else {
          return this.getProject();
        }
      },
      getProject: function() {
        var vm = this;
        if ($stateParams.uuid) {
          return projectsService.$get($stateParams.uuid).then(function(response) {
            vm.project = response;
            return vm.getList();
          });
        } else {
          return currentStateService.getProject().then(function(response) {
            vm.project = response;
            return vm.getList();
          });
        }
      }
    });

    controllerScope.__proto__ = new EventController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectAlertTabController', [
      'BaseAlertsListController',
      'currentStateService',
      ProjectAlertTabController
    ]);

  function ProjectAlertTabController(
    BaseAlertsListController,
    currentStateService
  ) {
    var controllerScope = this;
    var AlertController = BaseAlertsListController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this._super();
      },
      getList: function(filter) {
        var getList = this._super.bind(controllerScope),
          vm = this;
        this.service.defaultFilter.aggregate = 'project';
        this.service.defaultFilter.opened = true;
        return currentStateService.getProject().then(function(response) {
          vm.service.defaultFilter.uuid = response.uuid;
          return getList(filter);
        });
      }
    });

    controllerScope.__proto__ = new AlertController();
  }

})();

(function() {
  angular.module('ncsaas')
    .service('BaseProjectResourcesTabController', [
      'baseResourceListController', 'currentStateService', BaseProjectResourcesTabController]);

  function BaseProjectResourcesTabController(baseResourceListController, currentStateService) {
    var controllerClass = baseResourceListController.extend({
      getList: function(filter) {
        var vm = this;
        var fn = this._super.bind(vm);
        return currentStateService.getProject().then(function(project){
          vm.service.defaultFilter.project_uuid = project.uuid;
          return fn(filter);
        });
      }
    });
    return controllerClass;
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectVirtualMachinesListController', [
      'BaseProjectResourcesTabController',
      'ENV',
      ProjectVirtualMachinesListController
    ]);

  function ProjectVirtualMachinesListController(BaseProjectResourcesTabController, ENV) {
    var controllerScope = this;
    var ResourceController = BaseProjectResourcesTabController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.category = ENV.VirtualMachines;
        this._super();
        this.rowFields.push('internal_ips');
        this.rowFields.push('external_ips');
      },
      getTableOptions: function() {
        var options = this._super();
        options.noDataText = 'You have no virtual machines yet';
        options.noMatchesText = 'No virtual machines found matching filter.';
        options.columns.push({
          title: 'Internal IP',
          render: function(data, type, row, meta) {
            if (row.internal_ips.length === 0) {
              return '&ndash;';
            }
            return row.internal_ips.join(', ');
          }
        });
        options.columns.push({
          title: 'External IP',
          render: function(data, type, row, meta) {
            if (row.external_ips.length === 0) {
              return '&ndash;';
            }
            return row.external_ips.join(', ');
          }
        });
        return options;
      },
      getImportTitle: function() {
        return 'Import virtual machine';
      },
      getCreateTitle: function() {
        return 'Add virtual machine';
      },
    });
    controllerScope.__proto__ = new ResourceController();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('ProjectPrivateCloudsTabController', [
      'BaseProjectResourcesTabController',
      'ENV',
      ProjectPrivateCloudsTabController
    ]);

  function ProjectPrivateCloudsTabController(BaseProjectResourcesTabController, ENV) {
    var controllerScope = this;
    var ResourceController = BaseProjectResourcesTabController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.category = ENV.PrivateClouds;
        this._super();
      },
      getTableOptions: function() {
        var options = this._super();
        options.noDataText = 'You have no private clouds yet';
        options.noMatchesText = 'No private clouds found matching filter.';
        return options;
      },
      getImportTitle: function() {
        return 'Import private cloud';
      },
      getCreateTitle: function() {
        return 'Add private cloud';
      }
    });
    controllerScope.__proto__ = new ResourceController();
  }
})();

(function() {

  angular.module('ncsaas')
    .controller('ProjectApplicationsTabController', [
      'BaseProjectResourcesTabController', 'ENV',
      ProjectApplicationsTabController]);

  function ProjectApplicationsTabController(BaseProjectResourcesTabController, ENV) {
    var controllerScope = this;
    var ResourceController = BaseProjectResourcesTabController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this.category = ENV.Applications;
        this._super();
      },
      getTableOptions: function() {
        var options = this._super();
        options.noDataText = 'You have no applications yet.';
        options.noMatchesText = 'No applications found matching filter.';
        return options;
      },
      getImportTitle: function() {
        return 'Import application';
      },
      getCreateTitle: function() {
        return 'Add application';
      }
    });
    controllerScope.__proto__ = new ResourceController();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('StorageTabController', [
      '$scope',
      'resourcesService',
      'currentProject',
      StorageTabController]);

  function StorageTabController($scope, resourcesService, currentProject) {
    $scope.isNumber = angular.isNumber;
    $scope.tabs = [
      {
        title: 'Volumes',
        countKey: 'OpenStackTenant.Volume',
        viewKey: 'volumes'
      },
      {
        title: 'Snapshots',
        countKey: 'OpenStackTenant.Snapshot',
        viewKey: 'snapshots'
      }
    ];
    function refreshCount() {
      var query = {
        resource_category: 'storages',
        project: currentProject.uuid
      };
      resourcesService.cleanAllCache();
      resourcesService.countByType(query).then(function(counts) {
        angular.forEach($scope.tabs, function(tab) {
          tab.count = counts[tab.countKey];
        });
      });
    }
    $scope.$on('refreshCounts', function() {
      refreshCount();
    });
    refreshCount();
  }
})();

(function() {

  angular.module('ncsaas')
    .controller('VolumesListController', [
      'BaseProjectResourcesTabController',
      'ncUtils',
      '$state',
      '$filter',
      'ENV',
      VolumesListController]);

  function VolumesListController(BaseProjectResourcesTabController, ncUtils, $state, $filter, ENV) {
    var controllerScope = this;
    var ResourceController = BaseProjectResourcesTabController.extend({
      init:function() {
        this.category = ENV.Storages;
        this.controllerScope = controllerScope;
        this._super();
        this.rowFields.push('size');
        this.rowFields.push('instance');
        this.rowFields.push('instance_name');
      },
      getFilter: function() {
        return {
          resource_type: 'OpenStackTenant.Volume'
        };
      },
      getTableOptions: function() {
        var options = this._super();
        options.noDataText = 'You have no volumes yet.';
        options.noMatchesText = 'No volumes found matching filter.';
        options.columns.push({
          title: 'Size',
          className: 'all',
          render: function(data, type, row, meta) {
            if (!row.size) {
              return '&ndash;';
            }
            return $filter('filesize')(row.size);
          }
        });
        options.columns.push({
          title: 'Attached to',
          className: 'min-tablet-l',
          render: function(data, type, row, meta) {
            if (!row.instance) {
              return '&ndash;';
            }
            var uuid = ncUtils.getUUID(row.instance);
            var href = $state.href('resources.details', {
              uuid: uuid,
              resource_type: 'OpenStackTenant.Instance'
            });
            return ncUtils.renderLink(href, row.instance_name || 'OpenStack instance');
          }
        });
        return options;
      },
      getImportTitle: function() {
        return 'Import volumes';
      },
      getCreateTitle: function() {
        return 'Add volumes';
      }
    });
    controllerScope.__proto__ = new ResourceController();
  }
})();

(function() {

  angular.module('ncsaas')
    .controller('SnapshotsListController', [
      'BaseProjectResourcesTabController', 'ncUtils', '$state', '$filter',
      SnapshotsListController]);

  function SnapshotsListController(BaseProjectResourcesTabController, ncUtils, $state, $filter) {
    var controllerScope = this;
    var ResourceController = BaseProjectResourcesTabController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this._super();
        this.rowFields.push('size');
        this.rowFields.push('source_volume');
        this.rowFields.push('source_volume_name');
      },
      getFilter: function(filter) {
        return {
          resource_type: 'OpenStackTenant.Snapshot'
        };
      },
      getTableOptions: function() {
        var options = this._super();
        options.noDataText = 'You have no snapshots yet.';
        options.noMatchesText = 'No snapshots found matching filter.';
        options.columns.push({
          title: 'Size',
          className: 'all',
          render: function(data, type, row, meta) {
            if (!row.size) {
              return '&ndash;';
            }
            return $filter('filesize')(row.size);
          }
        });
        options.columns.push({
          title: 'Volume',
          render: function(data, type, row, meta) {
            if (!row.source_volume) {
              return 'Not known';
            }
            var uuid = ncUtils.getUUID(row.source_volume);
            var href = $state.href('resources.details', {
              uuid: uuid,
              resource_type: 'OpenStackTenant.Volume'
            });
            return ncUtils.renderLink(href, row.source_volume_name || 'Link');
          }
        });
        return options;
      },
      getImportTitle: function() {
        return 'Import snapshots';
      },
      getCreateTitle: function() {
        return 'Add snapshots';
      }
    });
    controllerScope.__proto__ = new ResourceController();
  }
})();
