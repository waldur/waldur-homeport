'use strict';

(function() {
  angular.module('ncsaas')
    .service('baseServiceListController', [
      'baseControllerListClass',
      'ENTITYLISTFIELDTYPES',
      'customerPermissionsService',
      'usersService',
      'joinService',
      baseServiceListController]);

  // need for service tab
  function baseServiceListController(
    baseControllerListClass,
    ENTITYLISTFIELDTYPES,
    customerPermissionsService,
    usersService,
    joinService
    ) {
    var ControllerListClass = baseControllerListClass.extend({
      init: function() {
        this.service = joinService;
        this._super();
        this.searchFieldName = 'name';
        this.canUserAddService();
        this.actionButtonsListItems = [
          {
            title: 'Remove',
            clickFunction: this.remove.bind(this.controllerScope)
          }
        ];
        this.entityOptions = {
          entityData: {
            noDataText: 'No services yet.',
            createLink: 'services.create',
            createLinkText: 'Create service',
          },
          list: [
            {
              name: 'Name',
              propertyName: 'name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'services.details({uuid: entity.uuid, provider: entity.provider})',
              className: 'name'
            }
          ]
        };
      },

      canUserAddService: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(user) {
          /*jshint camelcase: false */
          if (user.is_staff) {
            vm.canUserAddService = true;
          }
          customerPermissionsService.userHasCustomerRole(user.username, 'owner').then(function(hasRole) {
            vm.canUserAddService = hasRole;
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
      '$state',
      ServiceAddController]);

  function ServiceAddController(
    cloudsService,
    digitalOceanService,
    joinServiceProjectLinkService,
    currentStateService,
    projectsService,
    baseControllerAddClass,
    $q,
    $rootScope,
    $state) {
    var controllerScope = this;
    var ServiceController = baseControllerAddClass.extend({
      init: function() {
        this.service = cloudsService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('currentCustomerUpdated', this.activate.bind(this));
        this._super();
        this.listState = 'resources.list';
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

      successRedirect: function() {
        $state.go(this.listState, {tab: 'providers'});
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
      ['baseControllerDetailUpdateClass', 'joinService', '$stateParams', '$state', '$q', 'resourcesCountService', 'ENV',
        ServiceDetailUpdateController]);

  function ServiceDetailUpdateController(
    baseControllerDetailUpdateClass, joinService, $stateParams, $state, $q, resourcesCountService, ENV) {
    var controllerScope = this;
    var Controller = baseControllerDetailUpdateClass.extend({
      service: null,
      activeTab: 'projects',
      canEdit: true,

      init:function() {
        this._super();
        this.activate();
        this.detailsViewOptions = {
          title: 'Providers',
          activeTab: $stateParams.tab ? $stateParams.tab : this.activeTab,
          listState: 'services.list',
          aboutFields: [
            {
              fieldKey: 'name',
              isEditable: true,
              className: 'name'
            }
          ],
          tabs: [
            {
              title: 'Projects',
              key: 'projects',
              viewName: 'tabProjects',
              count: 0
            }
          ]
        };
      },
      activate:function() {
        var vm = this;
        joinService.$get($stateParams.provider, $stateParams.uuid).then(function(response) {
          vm.model = response;
          vm.afterActivate();
        }, function() {
          $state.go('errorPage.notFound');
        });
      },
      afterActivate: function() {
        var vm = controllerScope;
        vm.canEdit = vm.model;
        var countType = ENV.projectServiceLinkEndpoints[$stateParams.provider];
        $q.all([
          resourcesCountService[countType]({'scope': vm.model.url}),
        ]).then(function(responses) {
          vm.detailsViewOptions.tabs[0].count = responses[0];
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
      'baseControllerListClass',
      'joinServiceProjectLinkService',
      'ENTITYLISTFIELDTYPES',
      'ENV',
      'servicesService',
      ServiceProjectTabController
    ]);

  function ServiceProjectTabController(
    $stateParams,
    joinService,
    baseControllerListClass,
    joinServiceProjectLinkService,
    ENTITYLISTFIELDTYPES,
    ENV,
    servicesService) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      service: null,
      serviceProjects: [],

      init: function() {
        this.service = servicesService;
        this._super();
        this.activate();
        this.actionButtonsListItems = [
          {
            title: 'Delete',
            clickFunction: this.remove.bind(controllerScope)
          }
        ];
        this.entityOptions = {
          entityData: {
            noDataText: 'You have no projects yet.'
          },
          list: [
            {
              name: 'Name',
              propertyName: 'project_name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'projects.details({uuid: entity.project_uuid})',
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            },
            {
              name: 'State',
              propertyName: 'state',
              type: ENTITYLISTFIELDTYPES.noType
            }
          ]
        };
      },
      activate: function() {
        var vm = this;
        joinService.$get($stateParams.provider, $stateParams.uuid).then(function(response) {
          vm.serviceEntity = response;
          vm.getList();
        });
      },
      getList: function(filter) {
        if (this.serviceEntity) {
          this.service.defaultFilter = {'service': this.serviceEntity.uuid};
          this.service.endpoint = '/' + ENV.projectServiceLinkEndpoints[$stateParams.provider] + '/';
          this._super(filter);
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();
