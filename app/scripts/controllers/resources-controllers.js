'use strict';

(function() {
  angular.module('ncsaas')
    .service('baseResourceListController',
    ['baseControllerListClass',
    '$q',
    'ENV',
    'ENTITYLISTFIELDTYPES',
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
    resourcesService,
    servicesService,
    currentStateService) {
    var ControllerListClass = baseControllerListClass.extend({
      init: function() {
        this.service = resourcesService;
        this.blockUIElement = 'tab-content';
        this._super();
        this.searchFieldName = 'name';
        this.selectAll = true;
        this.hasFilters = false;
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
            checkQuotas: 'resource',
            timer: ENV.resourcesTimerInterval
          },
          list: [
            {
              propertyName: 'icon',
              titlePropertyName: 'icon_title',
              type: ENTITYLISTFIELDTYPES.icon,
              showForMobile: true,
              className: 'icon'
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
              type: ENTITYLISTFIELDTYPES.statusCircle,
              propertyName: 'state',
              onlineStatus: ENV.resourceOnlineStatus,
              className: 'visual-status',
              showForMobile: true,
            },
            {
              name: 'State',
              propertyName: 'state',
              type: ENTITYLISTFIELDTYPES.noType,
              className: 'status-name'
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
        var fn = this._super.bind(this);
        return this.adjustSearchFilters().then(function() {
          return fn(filter);
        });
      },
      adjustSearchFilters: function() {
        var vm = this;
        if (vm.hasFilters) {
          return $q.when(true);
        }

        vm.service.defaultFilter.resource_type = [];
        return servicesService.getResourceTypes(vm.category).then(function(types) {
          vm.service.defaultFilter.resource_type = types;
          return resourcesService.countByType(vm.service.defaultFilter).then(function(counts) {
            return servicesService.getServicesList().then(function(metadata) {
              var filters = [];
              for(var type in metadata) {
                var service = metadata[type];
                var resources = service.resources;
                for (var resource in resources) {
                  var id = servicesService.formatResourceType(type, resource);
                  if (counts[id] > 0) {
                    filters.push({
                      name: 'resource_type',
                      title: type + ' ' + resource + ' (' + counts[id] + ')',
                      value: id
                    });
                  }
                }
              }
              vm.searchFilters = filters;
              vm.hasFilters = true;
            });
          });
        });
      },
      afterGetList: function() {
        this.setAccessInfo();
        this.setIcon();
      },
      setAccessInfo: function() {
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
          else if (item.web_url && item.state == 'Online') {
            item.access_info_url = item.web_url;
            item.access_info_text = 'Open';
          }
        }
      },
      setIcon: function() {
        for (var i = 0; i < this.list.length; i++) {
          var item = this.list[i];
          var service_type = item.resource_type.split(".")[0];
          item.icon = "/static/images/appstore/icon-" + service_type.toLowerCase() + ".png";
          item.icon_title = item.resource_type;
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
          this.blockUIElement = 'tab-content';
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