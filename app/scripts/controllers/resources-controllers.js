'use strict';

(function() {
  angular.module('ncsaas')
    .service('baseResourceListController',
    ['baseControllerListClass',
    'ENV',
    'resourcesService',
    'priceEstimationService',
    'servicesService',
    'currentStateService',
    'projectsService',
    '$uibModal',
    '$rootScope',
    '$state',
    '$q',
    'resourceUtils',
    'ncUtils',
    baseResourceListController
    ]);

  // need for resource tab
  function baseResourceListController(
    baseControllerListClass,
    ENV,
    resourcesService,
    priceEstimationService,
    servicesService,
    currentStateService,
    projectsService,
    $uibModal,
    $rootScope,
    $state,
    $q,
    resourceUtils,
    ncUtils) {
    var ControllerListClass = baseControllerListClass.extend({
      init: function() {
        this.service = resourcesService;
        this.categories = {};
        this.categories[ENV.VirtualMachines] = 'vms';
        this.categories[ENV.Applications] = 'apps';
        this.categories[ENV.PrivateClouds] = 'private_clouds';
        this.categories[ENV.Storages] = 'storages';
        this.enableRefresh = true;

        this._super();
        this.hasCustomFilters = false;
      },
      toggleRefresh: function(open) {
        this.enableRefresh = !open;
      },
      resetCache: function () {
        if (!this.enableRefresh) {
          return;
        }
        this._super();
      },
      getTableOptions: function() {
        var vm = this;
        return {
          searchFieldName: 'name',
          noDataText: 'You have no resources yet.',
          noMatchesText: 'No resources found matching filter.',
          columns: [
            {
              title: 'Name',
              className: 'all',
              render: function(data, type, row, meta) {
                var img = '<img src="{src}" title="{title}" class="img-xs m-r-xs">'
                      .replace('{src}', resourceUtils.getIcon(row))
                      .replace('{title}', row.resource_type);
                var href = $state.href('resources.details', {
                  uuid: row.uuid,
                  resource_type: row.resource_type
                });
                return ncUtils.renderLink(href, img + ' ' + row.name);
              }
            },
            {
              title: 'Provider',
              className: 'desktop',
              render: function(data, type, row, meta) {
                return row.service_name;
              }
            },
            {
              title: 'State',
              className: 'min-tablet-l',
              render: function(data, type, row, meta) {
                var uuids = vm.list.map(function(item) {
                  return item.uuid;
                });
                var index = uuids.indexOf(row.uuid);
                return '<resource-state resource="controller.list[{index}]"></resource-state>'
                  .replace('{index}', index);
              }
            }
          ],
          tableActions: this.getTableActions(),
          rowActions: function(row) {
            var index;
            for (var i = 0; i < this.list.length; i++) {
              if (this.list[i].uuid === row.uuid) {
                index = i;
              }
            }
            return '<action-button-resource button-controller="controller" button-model="controller.list[' + index + ']"/>';
          }
        };
      },
      getTableActions: function() {
        var actions = [];
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('import') === -1) {
          actions.push(this.getImportAction());
        }
        if (this.category !== undefined) {
          actions.push(this.getCreateAction());
        }
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('openMap') === -1) {
          actions.push(this.getMapAction());
        }
        return actions;
      },
      getImportAction: function() {
        var disabled, tooltip;
        if (ncUtils.isCustomerQuotaReached(this.currentCustomer, 'resource')) {
          disabled = true;
          tooltip = 'Quota has been reached';
        } else if (!this.projectHasNonSharedService(this.currentProject)) {
          disabled = true;
          tooltip = 'Import is not possible as there are no personal provider accounts registered.';
        } else {
          disabled = false;
          tooltip = 'Import resources from the registered provider accounts.';
        }
        return {
          name: '<i class="fa fa-plus"></i> ' + this.getImportTitle(),
          callback: function() {
            $state.go('import.import');
          },
          disabled: disabled,
          titleAttr: tooltip
        };
      },
      getImportTitle: function() {
        return 'Import';
      },
      getCreateAction: function() {
        var disabled, tooltip;
        if (ncUtils.isCustomerQuotaReached(this.currentCustomer, 'resource')) {
          disabled = true;
          tooltip = 'Quota has been reached';
        }
        return {
          name: '<i class="fa fa-plus"></i> ' + this.getCreateTitle(),
          callback: function() {
            this.gotoAppstore();
          }.bind(this),
          disabled: disabled,
          titleAttr: tooltip
        };
      },
      getCreateTitle: function() {
        return 'Create';
      },
      gotoAppstore: function() {
        if (this.category === ENV.VirtualMachines) {
          $state.go('appstore.vms');
        } else if (this.category === ENV.PrivateClouds) {
          $state.go('appstore.private_clouds');
        } else if (this.category === ENV.Applications) {
          $state.go('appstore.apps');
        } else if (this.category === ENV.Storages) {
          $state.go('appstore.storages');
        }
      },
      getMapAction: function() {
        return {
          name: '<i class="fa fa-map-marker"></i> Open map',
          callback: this.openMap.bind(this)
        };
      },
      rowFields: [
        'uuid', 'url', 'name', 'state', 'runtime_state', 'created', 'error_message',
        'resource_type', 'latitude', 'longitude',
        'service_name', 'service_uuid', 'customer', 'service_settings_state',
        'service_settings_error_message', 'service_settings_uuid'
      ],
      getMarkers: function() {
        var items = this.controllerScope.list.filter(function hasCoordinates(item) {
          return item.latitude != null && item.longitude != null;
        });

        var points = {};
        items.forEach(function groupMarkersByCoordinates(item) {
          var key = [item.latitude, item.longitude];
          if (!points[key]) {
            points[key] = [];
          }
          points[key].push(item);
        });

        var markers = [];
        angular.forEach(points, function createMarker(items) {
          var item = items[0];
          var message = items.map(function(item) {
            return item.name;
          }).join('<br/>');
          markers.push({
            lat: item.latitude,
            lng: item.longitude,
            message: message
          });
        });
        return markers;
      },
      openMap: function() {
        var markers = this.getMarkers();

        if(!markers) {
          alert('No virtual machines with coordinates');
        } else {
          var scope = $rootScope.$new();
          scope.markers = markers;
          scope.maxbounds = new L.LatLngBounds(markers);
          $uibModal.open({
            template: '<leaflet width="100%" markers="markers" maxbounds="maxbounds"></leaflet>',
            windowClass: 'map-dialog',
            scope: scope
          });
        }
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
        var vm = this;
        var fn = this._super.bind(this);
        return $q.all([
          currentStateService.getCustomer().then(function(customer) {
            vm.currentCustomer = customer;
          }),
          currentStateService.getProject().then(function(project) {
            vm.currentProject = project;
          })
        ]).then(function() {
          vm.tableOptions = vm.getTableOptions();
          var query = angular.extend({}, filter, {
            field: vm.rowFields
          });
          if (angular.isDefined(vm.category) && !vm.getFilter().resource_type) {
            query.resource_category = vm.categories[vm.category];
            vm.updateFilters(filter);
          }
          return fn(query);
        });
      },
      updateFilters: function(filter) {
        var query = angular.extend({
          resource_category: this.categories[this.category],
          customer: currentStateService.getCustomerUuid()
        }, filter);
        angular.forEach(this.service.defaultFilter, function(val, key) {
          if (key != 'resource_type') {
            query[key] = val;
          }
        });
        return resourcesService.countByType(query).then(function(counts) {
          this.searchFilters = this.getFilterByCounts(counts);
        }.bind(this));
      },
      getFilterByCounts: function(counts) {
        var filters = [];
        angular.forEach(counts, function(count, resourceType) {
          if (count > 0) {
            filters.push({
              name: 'resource_type',
              title: resourceType.replace(".", " ") + ' (' + count + ')',
              value: resourceType
            });
          }
        });
        return filters;
      },
      afterGetList: function() {
        angular.forEach(this.list, function(resource) {
          resourcesService.cleanOptionsCache(resource.url);
        });
        this._super();
      },
      afterInstanceRemove: function(resource) {
        this._super(resource);
        servicesService.clearAllCacheForCurrentEndpoint();
        projectsService.clearAllCacheForCurrentEndpoint();
        priceEstimationService.clearAllCacheForCurrentEndpoint();
      },
      reInitResource:function(resource) {
        var vm = this;
        return vm.service.$get(resource.resource_type, resource.uuid).then(function(response) {
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
        '$rootScope',
        '$interval',
        'ENV',
        'resourcesService',
        'resourcesCountService',
        'resourceUtils',
        'alertsService',
        'servicesService',
        'baseControllerDetailUpdateClass',
        'currentStateService',
        'zabbixHostsService',
        'ncUtilsFlash',
        ResourceDetailUpdateController
      ]);

  function ResourceDetailUpdateController(
    $stateParams,
    $state,
    $scope,
    $rootScope,
    $interval,
    ENV,
    resourcesService,
    resourcesCountService,
    resourceUtils,
    alertsService,
    servicesService,
    baseControllerDetailUpdateClass,
    currentStateService,
    zabbixHostsService,
    ncUtilsFlash) {
    var controllerScope = this;
    var Controller = baseControllerDetailUpdateClass.extend({
      canEdit: true,
      defaultErrorMessage: ENV.defaultErrorMessage,

      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this._super();
        controllerScope.enableRefresh = true;
      },

      getModel: function() {
        return this.service.$get($stateParams.resource_type, $stateParams.uuid);
      },

      reInitResource: function() {
        if (!controllerScope.enableRefresh) {
          return;
        }
        return controllerScope.getModel().then(function(model) {
          controllerScope.model = model;
        }, function(error) {
          if (error.status === 404) {
            ncUtilsFlash.error('Resource is gone.');
            this.modelNotFound();
          }
        }.bind(this));
      },

      afterActivate: function() {
        this.viewHeaderLabel = resourceUtils.formatResourceType(this.model);
        this.updateMenu();
        this.updateResourceTab();
        this.scheduleRefresh();
        this.addMonitoringTabs();
      },

      updateMenu: function() {
        controllerScope.context = {resource: controllerScope.model};
        controllerScope.listState = this.getListState(this.model.resource_type)
                                    + "({uuid: ResourceCtrl.context.resource.project_uuid})";
        controllerScope.listTitle = this.getListTitle(this.model.resource_type);
      },

      getListTitle: function(resourceType) {
        var resourceCategory = ENV.resourceCategory[resourceType];
        if (resourceCategory === 'apps') {
          return 'Applications';
        } else if (resourceCategory === 'private_clouds') {
          return 'Private clouds';
        } else if (resourceCategory === 'storages') {
          return 'Storage';
        } else {
          return 'Virtual machines';
        }
      },

      getListState: function(resourceType) {
        var resourceCategory = ENV.resourceCategory[resourceType];
        if (resourceCategory === 'apps') {
          return 'project.resources.apps';
        } else if (resourceCategory === 'private_clouds') {
          return 'project.resources.clouds';
        } else if (resourceCategory === 'storages') {
          return 'project.resources.storage.tabs';
        } else {
          return 'project.resources.vms';
        }
      },

      addMonitoringTabs: function() {
        var vm = this;
        var host = vm.getZabbixHost(vm.model);
        if (host) {
          vm.showGraphs = true;
          vm.getITServiceForHost(host).then(function(itservice) {
            if (itservice) {
              vm.showSla = true;
            }
          });
        }
      },

      getZabbixHost: function(resource) {
        return resource.related_resources.filter(function(item) {
          return item.resource_type === 'Zabbix.Host';
        })[0];
      },

      getITServiceForHost: function(host) {
        return zabbixHostsService.$get(host.uuid).then(function(host) {
          return host.related_resources.filter(function(item) {
            return item.resource_type === 'Zabbix.ITService';
          })[0];
        });
      },

      updateResourceTab: function() {
        var resourceCategory = ENV.resourceCategory[this.model.resource_type];
        if (resourceCategory) {
          this.resourceTab = resourceCategory;
        } else {
          this.resourceTab = ENV.resourcesTypes.vms;
        }
      },

      toggleRefresh: function(open) {
        controllerScope.enableRefresh = !open;
      },

      scheduleRefresh: function() {
        var refreshPromise = $interval(
          this.reInitResource.bind(this),
          ENV.resourcesTimerInterval * 1000
        );

        $scope.$on('$destroy', function() {
          $interval.cancel(refreshPromise);
        });
      },

      afterInstanceRemove: function(resource) {
        this.service.clearAllCacheForCurrentEndpoint();
        $rootScope.$broadcast('refreshCounts');

        var state = this.getListState(this.model.resource_type);
        $state.go(state, {uuid: this.model.project_uuid});
      },

      modelNotFound: function() {
        currentStateService.getProject().then(function(project) {
          $state.go('project.details', {uuid: project.uuid});
        }, function() {
          currentStateService.getCustomer().then(function(response) {
            $state.go('organization.details', {uuid: response.uuid});
          }, function() {
            $state.go('dashboard.index');
          });
        });
      },

      update: function() {
        var vm = this;
        vm.model.$update(function success() {
          resourcesService.clearAllCacheForCurrentEndpoint();
        }, function error(response) {
          vm.errors = response.data;
        });
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();
