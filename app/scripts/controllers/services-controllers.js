'use strict';

(function() {
  angular.module('ncsaas')
    .service('baseServiceListController', [
      'baseControllerListClass',
      'ENTITYLISTFIELDTYPES',
      'customerPermissionsService',
      'usersService',
      'joinService',
      'ENV',
      baseServiceListController]);

  // need for service tab
  function baseServiceListController(
    baseControllerListClass,
    ENTITYLISTFIELDTYPES,
    customerPermissionsService,
    usersService,
    joinService,
    ENV
    ) {
    var ControllerListClass = baseControllerListClass.extend({
      init: function() {
        this.service = joinService;
        this._super();
        this.searchFieldName = 'name';
        this.checkPermissions();
        this.actionButtonsListItems = [
          {
            title: 'Remove',
            clickFunction: this.remove.bind(this.controllerScope),

            isDisabled: function(service) {
              return !this.canUserManageService || service.resources_count > 0;
            }.bind(this.controllerScope),

            tooltip: function(service) {
              if (!this.canUserManageService) {
                return 'Only customer owner or staff can remove provider';
              }
              if (service.resources_count > 0) {
               return 'Provider has resources. Please remove them first';
              }
            }.bind(this.controllerScope),
          },
          {
            title: 'Import resource',
            state: 'import.import'
          }
        ];
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('appstore') == -1) {
          this.actionButtonsListItems.push({
            title: 'Create resource',
            state: 'appstore.store'
          });
        }
        this.entityOptions = {
          entityData: {
            noDataText: 'No providers yet.',
            createLink: 'services.create',
            createLinkText: 'Create provider',
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.statusCircle,
              className: 'statusCircle',
              propertyName: 'state',
              onlineStatus: ENV.resourceOnlineStatus
            },
            {
              name: 'Name',
              propertyName: 'name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'services.details({uuid: entity.uuid, provider: entity.provider})',
              className: 'name'
            },
            {
              name: 'Type',
              propertyName: 'provider',
              type: ENTITYLISTFIELDTYPES.noType
            },
            {
              name: 'Resources',
              propertyName: 'resources_count',
              emptyText: '0'
            }
          ]
        };
      },

      checkPermissions: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(user) {
          /*jshint camelcase: false */
          if (user.is_staff) {
            vm.canUserManageService = true;
            return;
          }
          customerPermissionsService.userHasCustomerRole(user.username, 'owner').then(function(hasRole) {
            vm.canUserManageService = hasRole;
          });
        });
      }
    });

    return ControllerListClass;
  }

  angular.module('ncsaas')
    .controller('ServiceListController',
      ['baseServiceListController', ServiceListController]);

  function ServiceListController(baseServiceListController) {
    var controllerScope = this;
    var ServiceController = baseServiceListController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this._super();

      }
    });

    controllerScope.__proto__ = new ServiceController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ServiceAddController', [
      'cloudsService',
      'digitalOceanService',
      'joinServiceProjectLinkService',
      'currentStateService',
      'projectsService',
      'baseControllerAddClass',
      '$q',
      '$rootScope',
      ServiceAddController]);

  function ServiceAddController(
    cloudsService,
    digitalOceanService,
    joinServiceProjectLinkService,
    currentStateService,
    projectsService,
    baseControllerAddClass,
    $q,
    $rootScope) {
    var controllerScope = this;
    var ServiceController = baseControllerAddClass.extend({
      init: function() {
        this.service = cloudsService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('currentCustomerUpdated', this.activate.bind(this));
        this._super();
        this.listState = 'services.list';
        this.selectedService = this.serviceList[0];
      },
      serviceList: [
        {
          icon: '/static/images/icons/icon_openstack_small.png',
          name: 'OpenStack',
          id: 'openstack',
          service: cloudsService
        },
        {
          icon: '/static/images/icons/icon_digitalocean_small.png',
          name: 'Digital Ocean',
          id: 'digitalocean',
          service: digitalOceanService
        },
        {
          icon: '/static/images/icons/icon_aws_small.png',
          name: 'AWS',
          id: 'aws',
          service: null
        }
      ],
      setService: function(choice) {
        this.selectedService = choice;
        var instance = choice.service.$create();
        instance.customer = this.instance.customer;
        instance.auth_url = this.instance.auth_url;
        instance.token = this.instance.token;
        this.instance = instance;
      },
      activate: function() {
        var vm = this;
        currentStateService.getCustomer().then(function(customer) {
          vm.instance.customer = customer.url;
        });
        /*jshint camelcase: false */
        if (vm.instance.auth_url || vm.instance.name || vm.instance.token) {
          if (confirm('Clean all fields?')) {
            vm.instance.auth_url = '';
            vm.instance.name = '';
            vm.instance.token = '';
          }
        }
      },

      afterSave: function() {
        var vm = this;
        projectsService.getList().then(function(response) {
          var promises = [];
          for (var i = 0; response.length > i; i++) {
            promises.push(joinServiceProjectLinkService.add(response[i], vm.instance));
          }
          $q.all(promises).then(function() {
            $rootScope.$broadcast('refreshProjectList');
          });
        });
      },

      dummyCheckboxChange: function() {
        this.instance.auth_url = this.instance.dummy ? 'http://keystone.example.com:5000/v2.0' : '';
      }
    });

    controllerScope.__proto__ = new ServiceController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ServiceDetailUpdateController',
      ['baseControllerClass', 'joinService', '$stateParams', '$state', ServiceDetailUpdateController]);

  function ServiceDetailUpdateController(baseControllerClass, joinService, $stateParams, $state) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      service: null,
      activeTab: 'projects',

      init:function() {
        this._super();
        this.activate();
      },
      activate:function() {
        var vm = this;
        joinService.$get($stateParams.provider, $stateParams.uuid).then(function(response) {
          vm.service = response;
        });
      },
      remove:function() {
        if (confirm('Are you sure you want to delete service?')) {
          this.service.$delete(
            function() {
              $state.go('services.list');
            },
            function(errors) {
              alert(errors.data.detail);
            }
          );
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('ServiceProjectTabController', [
      '$stateParams',
      'joinService',
      'baseControllerClass',
      'joinServiceProjectLinkService',
      ServiceProjectTabController
    ]);

  function ServiceProjectTabController(
    $stateParams,
    joinService,
    baseControllerClass,
    joinServiceProjectLinkService) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      service: null,
      serviceProjects: [],

      init: function() {
        this._super();
        this.activate();
      },
      activate: function() {
        var vm = this;
        joinService.$get($stateParams.provider, $stateParams.uuid).then(function(response) {
          vm.service = response;
          vm.getServiceProjects();
        });
      },
      getServiceProjects: function() {
        var vm = this;
        joinServiceProjectLinkService.getList({'service': vm.service}).then(function(response) {
          vm.serviceProjects = response;
        });
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();
