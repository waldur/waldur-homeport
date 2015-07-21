'use strict';

(function() {
  angular.module('ncsaas')
    .service('baseResourceListController', ['baseControllerListClass', 'ENV', 'ENTITYLISTFIELDTYPES', baseResourceListController]);

  // need for resource tab
  function baseResourceListController(baseControllerListClass, ENV, ENTITYLISTFIELDTYPES) {
    var ControllerListClass = baseControllerListClass.extend({
      init: function() {
        this._super();
        this.searchFieldName = 'name';
        this.actionButtonsListItems = [
          {
            title: 'Start',
            clickFunction: this.startResource.bind(this.controllerScope),
            isDisabled: this.isOperationAvailable.bind(this.controllerScope, 'start')
          },
          {
            title: 'Stop',
            clickFunction: this.stopResource.bind(this.controllerScope),
            isDisabled: this.isOperationAvailable.bind(this.controllerScope, 'stop')
          },
          {
            title: 'Restart',
            clickFunction: this.restartResource.bind(this.controllerScope),
            isDisabled: this.isOperationAvailable.bind(this.controllerScope, 'restart')
          },
          {
            title: 'Remove',
            clickFunction: this.remove.bind(this.controllerScope),
            className: 'remove'
          }
        ];
        this.entityOptions = {
          entityData: {
            noDataText: 'You have no resources yet.'
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.statusCircle,
              propertyName: 'state',
              onlineStatus: ENV.resourceOnlineStatus
            },
            {
              name: 'Name',
              propertyName: 'name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'resources.details({uuid: entity.uuid, service_type: entity.service_type})',
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            },
            {
              name: 'Type',
              propertyName: 'resource_type',
              type: ENTITYLISTFIELDTYPES.noType
            },
            {
              name: 'Project',
              propertyName: 'project_name',
              type: ENTITYLISTFIELDTYPES.link,
              link: 'projects.details({uuid: entity.project_uuid })'
            },
            {
              name: 'Access',
              propertyName: 'external_ips',
              emptyText: 'No access info',
              type: ENTITYLISTFIELDTYPES.listInField
            }
          ]
        };
      },
      stopResource:function(resource) {
        var vm = this;
        vm.service.stopResource(resource.uuid).then(
          vm.reInitResource.bind(vm, resource), vm.handleActionException);
      },
      startResource:function(resource) {
        var vm = this;
        vm.service.startResource(resource.uuid).then(
          vm.reInitResource.bind(vm, resource), vm.handleActionException);
      },
      restartResource:function(resource) {
        var vm = this;
        vm.service.restartResource(resource.uuid).then(
          vm.reInitResource.bind(vm, resource), vm.handleActionException);
      },
      isOperationAvailable:function(operation, resource) {
        var availableOperations = this.service.getAvailableOperations(resource);
        operation = operation.toLowerCase();
        return availableOperations.indexOf(operation) !== -1;
      },
      reInitResource:function(resource) {
        var vm = this;
        vm.service.$get(resource.uuid).then(function(response) {
          var index = vm.list.indexOf(resource);
          vm.list[index] = response;
        });
      },
      connectSearchInput: function($scope) {
        var vm = this;
        $scope.$on('search', function(event, searchInput){
          vm.searchInput = searchInput;
          vm.search();
        })
        for (var i = 0; i < vm.searchFilters.length; i++) {
          var filter = vm.searchFilters[i];
          vm.service.defaultFilter[filter.name] = [];
        };
        for (var i = 0; i < vm.searchFilters.length; i++) {
          var filter = vm.searchFilters[i];
          vm.service.defaultFilter[filter.name].push(filter.value);
        };
      }
    });

    return ControllerListClass;
  }

  angular.module('ncsaas')
    .controller('ResourceListController', [
      'baseResourceListController',
      'ENTITYLISTFIELDTYPES',
      'ENV',
      'resourcesService',
      '$scope',
      ResourceListController]);

  function ResourceListController(baseResourceListController, ENTITYLISTFIELDTYPES, ENV, resourcesService, $scope) {
    var controllerScope = this;
    var ResourceController = baseResourceListController.extend({
      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this.searchFilters = [
          {
            name: 'resource_type',
            title: 'OpenStack',
            value: 'IaaS.Instance'
          },
          {
            name: 'resource_type',
            title: 'DigitalOcean',
            value: 'DigitalOcean.Droplet'
          },
          {
            name: 'resource_type',
            title: 'AWS EC2',
            value: 'Amazon.EC2'
          }
        ];
        this.selectAll = true;
        this.connectSearchInput($scope);
        this._super();

        this.entityOptions = {
          entityData: {
            noDataText: 'You have no resources yet.',
            createLink: 'resources.create',
            createLinkText: 'Create VM',
            importLink: 'import.import',
            importLinkText: 'Import VM'
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.statusCircle,
              propertyName: 'state',
              onlineStatus: ENV.resourceOnlineStatus
            },
            {
              name: 'Name',
              propertyName: 'name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'resources.details({uuid: entity.uuid, service_type: entity.service_type})',
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            },
            {
              name: 'Type',
              propertyName: 'resource_type',
              type: ENTITYLISTFIELDTYPES.noType
            },
            {
              name: 'Project',
              propertyName: 'project_name',
              type: ENTITYLISTFIELDTYPES.link,
              link: 'projects.details({uuid: entity.project_uuid })'
            }
          ]
        };
      }
    });

    controllerScope.__proto__ = new ResourceController();
  }

  angular.module('ncsaas')
    .controller('ApplicationListController', [
      'baseResourceListController',
      'ENTITYLISTFIELDTYPES',
      'ENV',
      'resourcesService',
      '$scope',
      ApplicationListController]);

  function ApplicationListController(baseResourceListController, ENTITYLISTFIELDTYPES, ENV, resourcesService, $scope) {
    var controllerScope = this;
    var ResourceController = baseResourceListController.extend({
      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this.searchFilters = [
          {
            name: 'resource_type',
            title: 'Oracle',
            value: 'Oracle.Database'
          },
          {
            name: 'resource_type',
            title: 'GitLab',
            value: 'GitLab.Project'
          }
        ];
        this.selectAll = true;
        this.connectSearchInput($scope);
        this._super();
        this.entityOptions = {
          entityData: {
            noDataText: 'You have no applications yet.',
            createLink: 'resources.create',
            createLinkText: 'Create app',
            importLink: 'import.import',
            importLinkText: 'Import app'
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.statusCircle,
              propertyName: 'state',
              onlineStatus: ENV.resourceOnlineStatus
            },
            {
              name: 'Name',
              propertyName: 'name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'resources.details({uuid: entity.uuid, service_type: entity.service_type})',
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            },
            {
              name: 'Type',
              propertyName: 'resource_type',
              type: ENTITYLISTFIELDTYPES.noType
            },
            {
              name: 'Project',
              propertyName: 'project_name',
              type: ENTITYLISTFIELDTYPES.link,
              link: 'projects.details({uuid: entity.project_uuid })'
            }
          ]
        };
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
        'digitalOceanResourcesService',
        'openstackService',
        'baseControllerDetailUpdateClass',
        ResourceDetailUpdateController
      ]);

  function ResourceDetailUpdateController(
    $stateParams,
    $scope,
    digitalOceanResourcesService,
    openstackService,
    baseControllerDetailUpdateClass) {
    var controllerScope = this;
    var Controller = baseControllerDetailUpdateClass.extend({
      activeTab: 'backups',

      init:function() {
        this.service_type = $stateParams.service_type;
        this.service = this.service_type == 'IaaS' ? openstackService : digitalOceanResourcesService;
        this.controllerScope = controllerScope;
        this._super();
        this.detailsState = 'resources.details';
        this.activeTab = $stateParams.tab ? $stateParams.tab : this.activeTab;
      },

      afterActivate: function() {
        $scope.$broadcast('resourceLoaded', this.model);
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('ResourceBackupListTabController', [
        '$scope',
        'BaseBackupListController',
        ResourceBackupListTabController
      ]);

    function ResourceBackupListTabController($scope, BaseBackupListController) {
        var controllerScope = this;
        var Controller = BaseBackupListController.extend({
          init:function() {
            this.controllerScope = controllerScope;
            this._super();
          },
          getList: function(filter) {
            var vm = this;
            var fn = this._super;
            $scope.$on('resourceLoaded', function(event, resource){
              vm.service.defaultFilter.backup_source = resource.url;
              fn.apply(vm, filter);
            })
          }
        });

      controllerScope.__proto__ = new Controller();
  }
})();


(function() {
  angular.module('ncsaas')
    .controller('ResourceController', ['$scope', ResourceController]);

    function ResourceController($scope) {
      $scope.search = function() {
        $scope.$broadcast('search', $scope.searchText);
      }
    }
})();
