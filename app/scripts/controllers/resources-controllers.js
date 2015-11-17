'use strict';

(function() {
  angular.module('ncsaas')
    .service('baseResourceListController',
    ['baseControllerListClass',
    'ENV',
    'ENTITYLISTFIELDTYPES',
    'resourcesService',
    'servicesService',
    'currentStateService',
    'projectsService',
    baseResourceListController
    ]);

  // need for resource tab
  function baseResourceListController(
    baseControllerListClass,
    ENV,
    ENTITYLISTFIELDTYPES,
    resourcesService,
    servicesService,
    currentStateService,
    projectsService) {
    var ControllerListClass = baseControllerListClass.extend({
      init: function() {
        this.service = resourcesService;
        this.blockUIElement = 'tab-content';
        this._super();
        this.searchFieldName = 'name';
        this.selectAll = true;
        this.hasFilters = false;
        var currentCustomerUuid = currentStateService.getCustomerUuid();
        this.actionButtonsListItems = [
          {
            title: 'Start',
            clickFunction: this.startResource.bind(this.controllerScope),
            isHidden: function(model) {
              return !this.isOperationAvailable('start', model);
            }.bind(this.controllerScope),
            isDisabled: function(model) {
              return !this.isOperationEnabled('start', model);
            }.bind(this.controllerScope)
          },
          {
            title: 'Stop',
            clickFunction: this.stopResource.bind(this.controllerScope),
            isHidden: function(model) {
              return !this.isOperationAvailable('stop', model);
            }.bind(this.controllerScope),
            isDisabled: function(model) {
              return !this.isOperationEnabled('stop', model);
            }.bind(this.controllerScope),
          },
          {
            title: 'Restart',
            clickFunction: this.restartResource.bind(this.controllerScope),
            isHidden: function(model) {
              return !this.isOperationAvailable('restart', model);
            }.bind(this.controllerScope),
            isDisabled: function(model) {
              return !this.isOperationEnabled('restart', model);
            }.bind(this.controllerScope)
          },
          {
            title: 'Remove',
            clickFunction: this.remove.bind(this.controllerScope),
            isDisabled: function(model) {
              return !this.isOperationEnabled('delete', model);
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
              name: 'Provider',
              propertyName: 'service_name',
              type: ENTITYLISTFIELDTYPES.link,
              link: 'organizations.details({uuid: "' + currentCustomerUuid +
              '",tab: "providers", providerUuid: entity.service_uuid, providerType: entity.resource_type.split(".")[0]})'
            },
            {
              name: 'State',
              type: ENTITYLISTFIELDTYPES.colorState,
              propertyName: 'state',
              className: 'visual-status',
              showForMobile: true,
              getClass: function(state) {
                var cls = ENV.resourceStateColorClasses[state];
                if (cls == 'processing') {
                  return 'icon refresh spin';
                } else {
                  return 'status-circle ' + cls;
                }
              }
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
        var vm = this,
          resourcesCounts = null;

        vm.service.defaultFilter.resource_type = [];

        return servicesService.getResourceTypes(vm.category).then(function(types) {
          vm.service.defaultFilter.resource_type = types;
        }).then(function() {
          return resourcesService.countByType(vm.service.defaultFilter);
        }).then(function(counts) {
          resourcesCounts = counts;
          return servicesService.getServicesList();
        }).then(function(metadata) {
          var filters = [];
          for(var type in metadata) {
            var service = metadata[type];
            var resources = service.resources;
            for (var resource in resources) {
              var id = servicesService.formatResourceType(type, resource);
              if (resourcesCounts[id] > 0) {
                filters.push({
                  name: 'resource_type',
                  title: type + ' ' + resource + ' (' + resourcesCounts[id] + ')',
                  value: id
                });
              }
            }
          }
          vm.searchFilters = filters;
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
        var vm = this;
        vm.service.operation('stop', resource.url).then(
          vm.reInitResource.bind(vm, resource),
          vm.handleActionException.bind(vm)
        );
      },
      startResource:function(resource) {
        var vm = this;
        vm.service.operation('start', resource.url).then(
          vm.reInitResource.bind(vm, resource),
          vm.handleActionException.bind(vm)
        );
      },
      restartResource:function(resource) {
        var vm = this;
        vm.service.operation('restart', resource.url).then(
          vm.reInitResource.bind(vm, resource),
          vm.handleActionException.bind(vm)
        );
      },
      removeInstance: function(resource) {
        return this.service.$deleteByUrl(resource.url);
      },
      unlink: function(resource) {
        var vm = this;
        vm.service.operation('unlink', resource.url).then(
          vm.afterInstanceRemove.bind(vm, resource),
          vm.handleActionException.bind(vm)
        );
      },
      afterInstanceRemove: function(resource) {
        this._super(resource);
        projectsService.clearAllCacheForCurrentEndpoint();
      },
      isOperationAvailable: function(operation, resource) {
        var availableOperations = this.service.getAvailableOperations(resource);
        return availableOperations.indexOf(operation.toLowerCase()) !== -1;
      },
      isOperationEnabled: function(operation, resource) {
        var availableOperations = this.service.getEnabledOperations(resource);
        return availableOperations.indexOf(operation.toLowerCase()) !== -1;
      },
      reInitResource:function(resource) {
        var vm = this;
        vm.service.$get(resource.resource_type, resource.uuid).then(function(response) {
          var index = vm.list.indexOf(resource);
          vm.list[index] = response;
          vm.afterGetList();
        });
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
        '$scope',
        '$interval',
        'ENV',
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
    $scope,
    $interval,
    ENV,
    resourcesService,
    resourcesCountService,
    alertsService,
    baseControllerDetailUpdateClass,
    currentStateService) {
    var controllerScope = this;
    var Controller = baseControllerDetailUpdateClass.extend({
      canEdit: true,

      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this._super();
        this.detailsViewOptions = {
          title: 'Resource',
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
              title: 'Details',
              key: 'details',
              viewName: 'tabDetails',
              count: -1
            },
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
              getCount: function() {
                var query = angular.extend(alertsService.defaultFilter, {scope: this.model.url});
                return resourcesCountService.alerts(query);
              }
            }
          ]
        };
        this.detailsViewOptions.activeTab = this.getActiveTab(this.detailsViewOptions.tabs, $stateParams.tab);
        this.cancelRefresh();
      },

      getModel: function() {
        return this.service.$get($stateParams.resource_type, $stateParams.uuid);
      },

      afterActivate: function() {
        this.setCounters();
        this.scheduleRefresh();
      },
      scheduleRefresh: function() {
        var vm = this;
        vm.updateStatus();
        if (!vm.inProgress) {
          return;
        }
        vm.refreshPromise = $interval(function() {
          vm.getModel().then(function(model) {
            vm.model.state = model.state;
            vm.updateStatus();
          });
        }, ENV.resourcesTimerInterval * 1000);
      },
      updateStatus: function() {
        var startStates = [
          'Provisioning Scheduled',
          'Provisioning',
          'Starting Scheduled',
          'Starting'
        ];
        this.inProgress = startStates.indexOf(this.model.state) != -1;
      },
      cancelRefresh: function() {
        var vm = this;
        vm.refreshPromise = null;
        $scope.$on('$destroy', function() {
          if (vm.refreshPromise) {
            $interval.cancel(vm.refreshPromise);
          }
        });
      },
      modelNotFound: function() {
        currentStateService.getProject().then(function() {
          $state.go('resources.list');
        }, function() {
          currentStateService.getCustomer().then(function(response) {
            $state.go('organizations.details', {uuid: response.uuid});
          }, function() {
            $state.go('dashboard.index');
          });
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
