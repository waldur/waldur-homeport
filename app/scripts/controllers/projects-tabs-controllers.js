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
          render: function(row) {
            if (row.internal_ips.length === 0) {
              return '&ndash;';
            }
            return row.internal_ips.join(', ');
          }
        });
        options.columns.push({
          title: 'External IP',
          render: function(row) {
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
