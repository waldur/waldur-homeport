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
            noDataText: 'No providers yet.',
            createLink: 'services.create',
            createLinkText: 'Create provider',
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
      'servicesService',
      'joinServiceProjectLinkService',
      'joinService',
      'currentStateService',
      'projectsService',
      'baseControllerAddClass',
      '$q',
      '$rootScope',
      ServiceAddController]);

  function ServiceAddController(
    servicesService,
    joinServiceProjectLinkService,
    joinService,
    currentStateService,
    projectsService,
    baseControllerAddClass,
    $q,
    $rootScope) {
    var controllerScope = this;
    var ServiceController = baseControllerAddClass.extend({
      init: function() {
        this.service = joinService;
        this.controllerScope = controllerScope;
        this.listState = 'services.list';
        this.successMessage = 'Provider has been created';
        this.setSignalHandler('currentCustomerUpdated', this.activate.bind(this));
        this._super();
      },
      categories: [
        {
          name: 'Virtual machines',
          services: ['Amazon', 'Azure', 'DigitalOcean', 'OpenStack'],
        },
        {
          name: 'Applications',
          services: ['Oracle', 'GitLab']
        }
      ],
      setModel: function(model) {
        this.model = model;
        this.model.serviceName = model.name;
        this.errors = {};
      },
      setCategory: function(category) {
        this.category = category;
        this.categoryServices = [];
        for (var i = 0; i < category.services.length; i++) {
          var name = category.services[i];
          var service = this.services[name];
          this.categoryServices.push(service);
        }
        this.setModel(this.categoryServices[0]);
      },
      activate: function() {
        var vm = this;
        currentStateService.getCustomer().then(function(customer) {
          vm.customer = customer;
        });
        servicesService.getServicesOptions().then(function(services) {
          vm.services = services;
          vm.setCategory(vm.categories[0]);
        });
      },

      beforeSave: function() {
        this.instance = this.service.$create(this.model.url);
        for (var i = 0; i < this.model.options.length; i++) {
          var option = this.model.options[i];
          if (option.value) {
            this.instance[option.key] = option.value;
          }
        }
        this.instance.customer = this.customer.url;
        this.instance.name = this.model.serviceName;
      },

      afterSave: function() {
        var vm = this;
        return projectsService.getList().then(function(projects) {
          var promises = projects.map(function(project) {
            return joinServiceProjectLinkService.add(
              vm.model.serviceProjectLinkUrl, vm.instance.url, project.url);
          });
          return $q.all(promises).then(function() {
            $rootScope.$broadcast('refreshProjectList');
          });
        });
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
