'use strict';

(function() {
  angular.module('ncsaas')
    .service('baseResourceListController',
    ['baseControllerListClass', 'ENV', 'ENTITYLISTFIELDTYPES', 'currentStateService', baseResourceListController]);

  // need for resource tab
  function baseResourceListController(baseControllerListClass, ENV, ENTITYLISTFIELDTYPES, currentStateService) {
    var ControllerListClass = baseControllerListClass.extend({
      init: function() {
        this._super();
        this.searchFieldName = 'name';
        this.actionButtonsListItems = [
          {
            title: 'Start',
            clickFunction: this.startResource.bind(this.controllerScope),
            isDisabled: function(model) {
              return !this.isOperationAvailable('start', model);
            }.bind(this.controllerScope)
          },
          {
            title: 'Stop',
            clickFunction: this.stopResource.bind(this.controllerScope),
            isDisabled: function(model) {
              return !this.isOperationAvailable('stop', model);
            }.bind(this.controllerScope)
          },
          {
            title: 'Restart',
            clickFunction: this.restartResource.bind(this.controllerScope),
            isDisabled: function(model) {
              return !this.isOperationAvailable('restart', model);
            }.bind(this.controllerScope)
          },
          {
            title: 'Remove',
            clickFunction: this.remove.bind(this.controllerScope),
            className: 'remove'
          },
          {
            title: 'Unlink',
            clickFunction: this.unlink.bind(this.controllerScope),
            className: 'remove'
          }
        ];
        this.entityOptions = {
          entityData: {
            noDataText: 'You have no resources yet.',
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.statusCircle,
              propertyName: 'state',
              onlineStatus: ENV.resourceOnlineStatus,
              className: 'visual-status'
            },
            {
              name: 'Name',
              propertyName: 'name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'resources.details({uuid: entity.uuid, resource_type: entity.resource_type})',
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            },
            {
              name: 'Type',
              propertyName: 'resource_type',
              type: ENTITYLISTFIELDTYPES.noType
            },
            {
              name: 'State',
              propertyName: 'state',
              type: ENTITYLISTFIELDTYPES.noType
            },
            {
              name: 'Access',
              propertyName: 'external_ips',
              emptyText: 'No access info',
              type: ENTITYLISTFIELDTYPES.listInField
            }
          ]
        };
        var vm = this;
        currentStateService.getProject().then(function(response) {
          if (response) {
            if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('appstore') == -1) {
              vm.entityOptions.entityData.createLink = 'appstore.store';
              vm.entityOptions.entityData.createLinkText = 'Create';
            }
            vm.entityOptions.entityData.importLink = 'import.import';
            vm.entityOptions.entityData.importLinkText = 'Import';
          }
        });
      },
      stopResource:function(resource) {
        resource.$action('stop', this.reInitResource.bind(this, resource), this.handleActionException);
      },
      startResource:function(resource) {
        resource.$action('start', this.reInitResource.bind(this, resource), this.handleActionException);
      },
      restartResource:function(resource) {
        resource.$action('restart', this.reInitResource.bind(this, resource), this.handleActionException);
      },
      isOperationAvailable:function(operation, resource) {
        var availableOperations = this.service.getAvailableOperations(resource);
        operation = operation.toLowerCase();
        return availableOperations.indexOf(operation) !== -1;
      },
      reInitResource:function(resource) {
        var vm = this;
        vm.service.$get(resource.resource_type, resource.uuid).then(function(response) {
          var index = vm.list.indexOf(resource);
          vm.list[index] = response;
        });
      },
      unlink: function(resource) {
        var vm = this;
        resource.$action('unlink', function() {
          vm.afterInstanceRemove(resource);
        }, vm.handleActionException);
      }
    });

    return ControllerListClass;
  }

  angular.module('ncsaas')
    .controller('ResourceListController', ['baseResourceListController', 'resourcesService', ResourceListController]);

  function ResourceListController(baseResourceListController, resourcesService) {
    var controllerScope = this;
    var ResourceController = baseResourceListController.extend({
      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this._super();
      }
    });

    controllerScope.__proto__ = new ResourceController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ResourceAddController',
    ['resourcesService', 'projectCloudMembershipsService', 'projectsService',
      'keysService', 'templatesService', 'baseControllerAddClass', 'cloudsService',
      ResourceAddController]);

  function ResourceAddController(
    resourcesService, projectCloudMembershipsService, projectsService, keysService,
    templatesService, baseControllerAddClass, cloudsService) {
    var controllerScope = this;
    var ResourceController = baseControllerAddClass.extend({
      showServices: false,
      showFlavors: false,
      showTemplates: false,
      showKeys: false,

      serviceList: {},
      flavorList: {},
      keyList: {},
      projectList: {},
      templateList:{},
      selectedProject: null,

      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('currentCustomerUpdated', this.currentCustomerUpdatedHandler.bind(this));
        this._super();
        this.listState = 'resources.list';
        this.resource = this.instance;
      },
      activate:function() {
        var vm = this;
        // projects
        projectsService.getList().then(function(response) {
          vm.projectList = response;
        });
        // keys
        keysService.getCurrentUserKeyList().then(function(response) {
          vm.keyList = response;
        });
      },
      setService:function(projectCloudMemberships) {
        var vm = this;
        var url = projectCloudMemberships.cloud,
          array = url.split ('/').filter(function(el) {
            return el.length !== 0;
          }),
          uuid = array[4];
        cloudsService.$get(uuid).then(function(response) {
          var service = response;
          vm.flavorList = service.flavors;
          templatesService.getList({cloud: service.uuid}).then(function(response) {
            vm.templateList = response;
          });
          vm.selectedService = projectCloudMemberships;
          vm.showTemplates = true;
        });
      },
      setTemplate:function(tamplate) {
        var vm = this;
        vm.resource.template = tamplate.url;
        vm.selectedTemplate = tamplate;
        vm.showFlavors = true;
      },
      setFlavor:function(flavor) {
        var vm = this;
        vm.resource.flavor = flavor.url;
        vm.selectedFlavor = flavor;
        vm.showKeys = true;
      },
      setProject:function(project) {
        var vm = this;
        if (project) {
          vm.resource.project = project.url;
          vm.showServices = true;
          // projectCloudMemberships
          projectCloudMembershipsService.getList({project: project.uuid}).then(function(response) {
            vm.serviceList = response;
          });
        } else {
          vm.serviceList = {};
        }
      },
      setKey:function(key) {
        var vm = this;
        vm.resource.ssh_public_key = key.url;
        vm.selectedKey = key;
      },
      currentCustomerUpdatedHandler:function() {
        var vm = this.controllerScope;
        vm.showFlavors = false;
        vm.showTemplates = false;
        vm.selectedProject = null;
        vm.serviceList = {};
        vm.flavorList = {};
        vm.keyList = {};
        vm.projectList = {};
        vm.templateList = {};
        vm.activate();
      }
    });

    controllerScope.__proto__ = new ResourceController();
  }
})();

(function() {
  angular.module('ncsaas')
      .controller('ResourceDetailUpdateController', [
        '$stateParams',
        '$scope',
        '$state',
        'resourcesService',
        'baseControllerDetailUpdateClass',
        ResourceDetailUpdateController
      ]);

  function ResourceDetailUpdateController(
    $stateParams,
    $scope,
    $state,
    resourcesService,
    baseControllerDetailUpdateClass) {
    var controllerScope = this;
    var Controller = baseControllerDetailUpdateClass.extend({
      activeTab: 'backups',
      canEdit: true,

      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this._super();
        this.activeTab = $stateParams.tab ? $stateParams.tab : this.activeTab;
        this.detailsViewOptions = {
          title: 'Resource',
          activeTab: $stateParams.tab ? $stateParams.tab : this.activeTab,
          listState: 'resources.list',
          aboutFields: [
            {
              fieldKey: 'name',
              isEditable: true,
              className: 'name'
            }
          ],
          tabs: [
            {
              title: 'Backups',
              key: 'backups',
              viewName: 'tabBackups',
              count: 0
            }
          ]
        };
      },

      activate:function() {
        var vm = this;
        vm.service.$get($stateParams.resource_type, $stateParams.uuid).then(function(response) {
          vm.model = response;
          $scope.$broadcast('resourceLoaded', vm.model);
        }, function() {
          $state.go('errorPage.notFound');
        });
      },

      update:function() {
        var vm = this;
        vm.model.$update(success, error);
        function success() {
          $state.go('resources.details', {'resource_type': $stateParams.resource_type, 'uuid': vm.model.uuid});
        }
        function error(response) {
          vm.errors = response.data;
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('ResourceBackupListTabController', [
      'currentStateService',
      'BaseBackupListController',
      '$stateParams',
      ResourceBackupListTabController
      ]);

    function ResourceBackupListTabController(currentStateService, BaseBackupListController, $stateParams) {
      var controllerScope = this;
      var Controller = BaseBackupListController.extend({
        init:function() {
          this.controllerScope = controllerScope;
          this._super();
        },
        getList: function(filter) {
          var vm = this;
          if ($stateParams.uuid) {
            this.service.defaultFilter.project_uuid = $stateParams.uuid;
            this._super(filter);
          } else {
            var fn = this._super.bind(controllerScope);
            currentStateService.getProject().then(function(response) {
              vm.service.defaultFilter.project_uuid = response.uuid;
              fn(filter);
            });
          }
        }
      });

      controllerScope.__proto__ = new Controller();
  }
})();
