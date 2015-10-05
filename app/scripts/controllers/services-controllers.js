'use strict';

(function() {
  angular.module('ncsaas')
    .service('baseServiceListController', [
      'baseControllerListClass',
      'ENTITYLISTFIELDTYPES',
      'customerPermissionsService',
      'currentStateService',
      'usersService',
      'joinService',
      'ENV',
      'blockUI',
      baseServiceListController]);

  // need for service tab
  function baseServiceListController(
    baseControllerListClass,
    ENTITYLISTFIELDTYPES,
    customerPermissionsService,
    currentStateService,
    usersService,
    joinService,
    ENV,
    blockUI
    ) {
    var ControllerListClass = baseControllerListClass.extend({
      customerHasProjects: true,
      init: function() {
        this.service = joinService;
        this._super();
        this.searchFieldName = 'name';
        this.checkPermissions();
        this.checkProjects();
        this.actionButtonsListItems = [
          {
            title: 'Remove',
            clickFunction: this.remove.bind(this.controllerScope),

            isDisabled: function(service) {
              return service.shared || !this.canUserManageService || service.resources_count > 0;
            }.bind(this.controllerScope),

            tooltip: function(service) {
              if (service.shared) {
                return 'You cannot remove shared provider';
              }
              if (!this.canUserManageService) {
                return 'Only customer owner or staff can remove provider';
              }
              if (service.resources_count > 0) {
               return 'Provider has resources. Please remove them first';
              }
            }.bind(this.controllerScope),
          }
        ];
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('resources') == -1) {
          this.actionButtonsListItems.push({
            title: 'Create resource',
            state: 'appstore.store'
          });
        }
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('import') == -1) {
          this.actionButtonsListItems.push({
            title: 'Import resource',
            state: 'import.import',

            isDisabled: function(service) {
              return service.shared || !this.customerHasProjects;
            }.bind(this.controllerScope),

            tooltip: function(service) {
              if (service.shared) {
                return 'You cannot import resources from shared provider';
              }
              if (!this.customerHasProjects) {
                return 'Can not import resources until project is created';
              }
            }.bind(this.controllerScope),
          });
        }
        this.entityOptions = {
          entityData: {
            noDataText: 'No providers yet.',
            createLink: 'services.create',
            createLinkText: 'Create provider',
            checkQuotas: 'service',
            showMessage: true
          },
          list: [
            {
              name: 'Name',
              propertyName: 'name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'services.details({uuid: entity.uuid, provider: entity.service_type})',
              className: 'name',
              showForMobile: true
            },
            {
              name: 'Type',
              propertyName: 'service_type',
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
      checkProjects: function() {
        var vm = this;
        currentStateService.getCustomer().then(function(customer) {
          vm.customerHasProjects = (customer.projects.length > 0);
        });
      },
      removeInstance: function(model) {
        return this.service.$deleteByUrl(model.url);
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
      },
      getList: function(filters) {
        var providerTab = blockUI.instances.get('tab-content');
        providerTab.start();
        return this._super(filters).then(function(response) {
          providerTab.stop();
        });
      }
    });

    return ControllerListClass;
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
      'ENV',
      '$q',
      '$rootScope',
      '$state',
      '$window',
      ServiceAddController]);

  function ServiceAddController(
    servicesService,
    joinServiceProjectLinkService,
    joinService,
    currentStateService,
    projectsService,
    baseControllerAddClass,
    ENV,
    $q,
    $rootScope,
    $state,
    $window) {
    var controllerScope = this;
    var ServiceController = baseControllerAddClass.extend({
      init: function() {
        this.service = joinService;
        this.controllerScope = controllerScope;
        this.listState = 'organizations.details({uuid: "'
          + $window.localStorage[ENV.currentCustomerUuidStorageKey]
          +'", tab: "providers"})';
        this.successMessage = 'Provider has been created';
        this.setSignalHandler('currentCustomerUpdated', this.activate.bind(this));
        this.categories = ENV.serviceCategories;
        this._super();
      },
      setModel: function(model) {
        this.model = angular.copy(model);
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
        this.instance.dummy = this.model.dummy;
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
      },

      successRedirect: function() {
        currentStateService.getCustomer().then(function(customer) {
          $state.go('organizations.details', {uuid: customer.uuid, tab: 'providers'});
        });
      }
    });

    controllerScope.__proto__ = new ServiceController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('ServiceDetailUpdateController',
      ['baseControllerDetailUpdateClass', 'joinService', '$stateParams', '$state', '$q', 'resourcesCountService', 'ENV',
        '$window',
        ServiceDetailUpdateController]);

  function ServiceDetailUpdateController(
    baseControllerDetailUpdateClass, joinService, $stateParams, $state, $q, resourcesCountService, ENV, $window) {
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
          listState: 'organizations.details({uuid: "'+ $window.localStorage[ENV.currentCustomerUuidStorageKey] +'", tab: "providers"})',
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
              $state.go('organizations.details', {uuid: $window.localStorage[ENV.currentCustomerUuidStorageKey], tab: "providers"});
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
      'currentStateService',
      ServiceProjectTabController
    ]);

  function ServiceProjectTabController(
    $stateParams,
    joinService,
    baseControllerListClass,
    joinServiceProjectLinkService,
    ENTITYLISTFIELDTYPES,
    ENV,
    servicesService,
    currentStateService) {
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
          return this._super(filter);
        }
      },
      afterGetList: function() {
        this.setCurrentProject();
      },
      setCurrentProject: function() {
        var vm = this;
        currentStateService.getProject().then(function(response) {
          vm.currentProject = response;
          if (response) {
            vm.entityOptions.list[0]['description'] = {
              condition: vm.currentProject.uuid,
              text: '[Active]',
              field: 'project_uuid'
            };
          }
        });
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();
