'use strict';

(function() {
  angular.module('ncsaas')
    .service('baseResourceListController',
    ['baseControllerListClass',
    '$q',
    'ENV',
    'ENTITYLISTFIELDTYPES',
    'blockUI',
    'resourcesService',
    'servicesService',
    'currentStateService',
    baseResourceListController
    ]);

  // need for resource tab
  function baseResourceListController(
    baseControllerListClass,
    $q,
    ENV,
    ENTITYLISTFIELDTYPES,
    blockUI,
    resourcesService,
    servicesService,
    currentStateService) {
    var ControllerListClass = baseControllerListClass.extend({
      init: function() {
        this.service = resourcesService;
        this._super();
        this.searchFieldName = 'name';
        this.selectAll = true;
        this.category = ENV.AllResources;
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
            isDisabled: function(model) {
              return !this.isOperationAvailable('delete', model);
            }.bind(this.controllerScope),
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
            noMatchesText: 'No resources found matching filter.',
            checkQuotas: 'resource'
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.statusCircle,
              propertyName: 'state',
              onlineStatus: ENV.resourceOnlineStatus,
              className: 'visual-status',
              showForMobile: true,
            },
            {
              name: 'Name',
              propertyName: 'name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'resources.details({uuid: entity.uuid, resource_type: entity.resource_type})',
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile,
              className: 'resource-name'
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
              propertyName: 'access_info_text',
              urlProperyName: 'access_info_url',
              type: ENTITYLISTFIELDTYPES.linkOrText,
              showForMobile: true,
              className: 'resource-access'
            }
          ]
        };
        var vm = this;
        currentStateService.getProject().then(function(project) {
          if (project) {
            if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('resources') == -1) {
              vm.entityOptions.entityData.createLink = 'appstore.store';
              vm.entityOptions.entityData.createLinkText = 'Create';
            }
            if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('import') == -1) {
              vm.entityOptions.entityData.importLink = 'import.import';
              vm.entityOptions.entityData.importLinkText = 'Import';
              if (!vm.projectHasNonSharedService(project)) {
                vm.entityOptions.entityData.importDisabled = true;
                vm.entityOptions.entityData.importLinkTooltip = 'Import is not possible as there are no personal provider accounts registered.';
              } else {
                vm.entityOptions.entityData.importDisabled = false;
                vm.entityOptions.entityData.importLinkTooltip = 'Import resources from the registered provider accounts.';
              }
            }
          }
        });
      },
      projectHasNonSharedService: function(project) {
        for (var i = 0; i < project.services.length; i++) {
          var service = project.services[i];
          if (!service.shared) {
            return true;
          }
        }
        return false;
      },
      getList: function(filter) {
        var block = blockUI.instances.get('tab-content');
        block.start();

        var fn = this._super.bind(this);
        this.adjustSearchFilters().then(function() {
          return fn(filter).finally(function() {
            block.stop();
          });
        });
      },
      adjustSearchFilters: function() {
        var vm = this;
        if (vm.searchFilters.length == 0) {
          return vm.getFilters(vm.category).then(function(filters) {
            vm.searchFilters = filters;
            vm.service.defaultFilter.resource_type = [];
            for (var i = 0; i < filters.length; i++) {
              vm.service.defaultFilter[filters[i].name].push(filters[i].value);
            }
          });
        } else {
          return $q.when(true);
        }
      },
      getFilters: function(category) {
        var services = this.getServices(category);
        if (services == []) {
          return $q.when([]);
        }
        return servicesService.getServicesList().then(function(metadata) {
          var filters = [];
          for (var i = 0; i < services.length; i++) {
            var service = services[i];
            if (!metadata[service]) {
              continue;
            }
            var resources = metadata[service].resources;
            for (var resource in resources) {
              filters.push({
                name: 'resource_type',
                title: service,
                value: service + '.' + resource
              });
            }
          }
          return filters;
        });
      },
      getServices: function(category) {
        if (category == ENV.AllResources) {
          var services = [];
          for (var i = 0; i < ENV.appStoreCategories.length; i++) {
            var item = ENV.appStoreCategories[i].services;
            for (var i = 0; i < item.length; i++) {
              services.push(item[i]);
            }
          }
          return services;
        } else if (!(ENV.appStoreCategories[category])) {
          return [];
        } else {
          return ENV.appStoreCategories[category].services;
        }
      },
      afterGetList: function() {
        for (var i = 0; i < this.list.length; i++) {
          var item = this.list[i];
          item.access_info_text = 'No access info';
          if (item.external_ips && item.external_ips.length > 0) {
            item.access_info_text = item.external_ips.join(', ');
          }
          else if (item.rdp && item.state == 'Online') {
            item.access_info_url = item.rdp;
            item.access_info_text = 'Connect';
          }
        }
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
      .controller('ResourceDetailUpdateController', [
        '$stateParams',
        '$state',
        'resourcesService',
        'resourcesCountService',
        'alertsService',
        'baseControllerDetailUpdateClass',
        'currentStateService',
        ResourceDetailUpdateController
      ]);

  function ResourceDetailUpdateController(
    $stateParams,
    $state,
    resourcesService,
    resourcesCountService,
    alertsService,
    baseControllerDetailUpdateClass,
    currentStateService) {
    var controllerScope = this;
    var Controller = baseControllerDetailUpdateClass.extend({
      activeTab: 'alerts',
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
            },
            {
              title: 'Alerts',
              key: 'alerts',
              viewName: 'tabAlerts',
              count: 0
            }
          ]
        };
      },

      activate:function() {
        var vm = this;
        vm.service.$get($stateParams.resource_type, $stateParams.uuid).then(function(response) {
          vm.model = response;
          vm.setCounters();
        }, function() {
          currentStateService.getProject().then(function() {
            $state.go('resources.list');
          }, function() {
            currentStateService.getCustomer().then(function(response) {
              $state.go('organizations.details', {uuid: response.uuid});
            }, function() {
              $state.go('dashboard.index');
            });
          });
        });
      },

      setCounters: function() {
        var vm = this;
        var query = angular.extend(alertsService.defaultFilter, {scope: vm.model.url});
        resourcesCountService.alerts(query).then(function(response) {
          vm.detailsViewOptions.tabs[1].count = response;
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
            return this._super(filter);
          } else {
            var fn = this._super.bind(controllerScope);
            return currentStateService.getProject().then(function(response) {
              vm.service.defaultFilter.project_uuid = response.uuid;
              return fn(filter);
            });
          }
        }
      });

      controllerScope.__proto__ = new Controller();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('ResourceAlertsListController', [
      'BaseAlertsListController',
      'resourcesService',
      '$stateParams',
      ResourceAlertsListController]);

  function ResourceAlertsListController(
    BaseAlertsListController,
    resourcesService,
    $stateParams) {
    var controllerScope = this;
    var controllerClass = BaseAlertsListController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this._super();
      },

      getList: function(filter) {
        var vm = this;
        var fn = this._super.bind(vm);
        filter = filter || {};
        return resourcesService.$get($stateParams.resource_type, $stateParams.uuid).then(function(resource) {
          vm.service.defaultFilter.scope = resource.url;
          vm.service.defaultFilter.opened = true;
          return fn(filter);
        })
      }
    });

    controllerScope.__proto__ = new controllerClass();
  }
})();