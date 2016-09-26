'use strict';

(function() {
  angular.module('ncsaas')
    .service('baseResourceListController',
    ['baseControllerListClass',
    'ENV',
    'ENTITYLISTFIELDTYPES',
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
    ENTITYLISTFIELDTYPES,
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

        this._super();
        this.hasCustomFilters = false;

        var vm = this;
        vm.loading = true;
        $q.all([
          currentStateService.getCustomer().then(function(customer) {
            vm.currentCustomer = customer;
          }),
          currentStateService.getProject().then(function(project) {
            vm.currentProject = project;
          })
        ]).finally(function() {
          vm.loading = false;
          vm.getTableOptions();
        });
        this.tableOptions = {};
        this.entityOptions = {entityData: {}};
      },
      getTableOptions: function() {
        this.tableOptions = {
          searchFieldName: 'name',
          noDataText: 'You have no resources yet.',
          noMatchesText: 'No resources found matching filter.',
          columns: [
            {
              title: 'Name',
              render: function(data, type, row, meta) {
                var img = '<img src="{src}" title="{title}" class="img-xs m-r-xs">'
                      .replace('{src}', resourceUtils.getIcon(row))
                      .replace('{title}', row.resource_type);
                var href = $state.href('resources.details', {
                  uuid: row.uuid,
                  resource_type: row.resource_type
                });
                return '<a href="{href}">{name}</a>'
                          .replace('{href}', href)
                          .replace('{name}', img + ' ' + row.name);
              }
            },
            {
              title: 'Provider',
              render: function(data, type, row, meta) {
                var parts = row.customer.split('/');
                var customer_uuid = parts[parts.length - 2];
                var provider_type = row.resource_type.split(".")[0];
                var href = $state.href('organization.providers', {
                  uuid: customer_uuid,
                  providerUuid: row.service_uuid,
                  providerType: provider_type
                });
                return '<a href="{href}">{name}</a>'
                          .replace('{href}', href)
                          .replace('{name}', row.service_name);
              }
            },
            {
              title: 'State',
              render: function(data, type, row, meta) {
                var cls = ENV.resourceStateColorClasses[row.state];
                var title = row.state;
                if (cls === 'processing') {
                  cls = 'fa-refresh fa-spin';
                  title = row.runtime_state;
                } else {
                  cls = 'status-circle ' + cls;
                }
                if (cls === 'status-circle erred') {
                  title = row.error_message;
                }
                return '<a class="{cls}" title="{title}"></a> {state}'
                          .replace('{cls}', cls)
                          .replace('{state}', row.runtime_state || row.state)
                          .replace('{title}', title);
              },
            }
          ],
          tableActions: this.getTableActions()
        };
      },
      getTableActions: function() {
        var actions = [];
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('import') == -1) {
          actions.push(this.getImportAction());
        }
        actions.push(this.getCreateAction());
        actions.push(this.getMapAction());
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
          $state.go('appstore.store', {category: 'vms'});
        } else if (this.category === ENV.PrivateClouds) {
          $state.go('appstore.store', {category: 'private_clouds'});
        } else if (this.category === ENV.Applications) {
          $state.go('appstore.store', {category: 'apps'});
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
        'service_name', 'service_uuid', 'customer'
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
        var query = angular.extend({}, filter, {
          resource_category: this.categories[this.category],
          field: this.rowFields
        });
        this.updateFilters(filter);
        return this._super(query);
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
      .controller('ResizeDropletController', [
        '$scope',
        'resourcesService',
        'resourceUtils',
        'actionUtilsService',
        ResizeDropletController
      ]);

  function ResizeDropletController($scope, resourcesService, resourceUtils, actionUtilsService) {
    angular.extend($scope, {
      loading: true,
      options: {
        resizeType: 'flexible',
        newSize: null,
      },
      init: function() {
        $scope.loadDroplet().then(function() {
          return $scope.loadValidSizes().then(function() {
            $scope.loading = false;
          });
        }).catch(function(error) {
          $scope.loading = false;
          $scope.error = error.message;
        });
      },
      formatSize: resourceUtils.formatFlavor,
      loadDroplet: function() {
        return resourcesService.$get(null, null, $scope.resource.url, {
          field: ['cores', 'ram', 'disk']
        }).then(function(droplet) {
          angular.extend($scope.resource, droplet);
        });
      },
      loadValidSizes: function() {
        return actionUtilsService.loadActions($scope.resource).then(function(actions) {
          $scope.action = actions.resize;
          if (!$scope.action.enabled) {
            return;
          }
          return actionUtilsService.loadRawChoices($scope.action.fields.size).then(function(sizes) {
            sizes.forEach(function(size) {
              size.enabled = $scope.isValidSize(size);
            });
            sizes.sort(function(size1, size2) {
              return size1.enabled < size2.enabled;
            });
            $scope.sizes = sizes;
          });
        });
      },
      isValidSize: function(size) {
        // 1. New size should not be the same as the current size
        // 2. New size disk should not be lower then current size disk
        var droplet = $scope.resource;
        return size.disk !== droplet.disk &&
               size.cores !== droplet.cores &&
               size.ram !== droplet.ram &&
               size.disk >= droplet.disk;
      },
      submitForm: function() {
        var form = resourcesService.$create($scope.action.url);
        form.size = $scope.options.newSize.url;
        form.disk = $scope.options.resizeType === 'permanent';
        return form.$save().then(function(response) {
          actionUtilsService.handleActionSuccess($scope.action);
          $scope.errors = {};
          $scope.$close();
          $scope.controller.reInitResource($scope.resource);
        }, function(response) {
          $scope.errors = response.data;
        });
      }
    });
    $scope.init();
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
      defaultErrorMessage: "Reason unknown, please contact support",

      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this._super();
        this.detailsState = 'resources.details';
        this.detailsViewOptions = {
          title_plural: 'resources',
          listState: 'project.details({uuid: controller.model.project_uuid, tab:controller.resourceTab})',
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
              count: -1,
              hideSearch: true
            },
            {
              title: 'Alerts',
              key: 'alerts',
              viewName: 'tabAlerts',
              countFieldKey: 'alerts'
            },
          ]
        };
        this.detailsViewOptions.activeTab = this.getActiveTab();
        this.activeTab = this.detailsViewOptions.activeTab.key;
      },

      getModel: function() {
        return this.service.$get($stateParams.resource_type, $stateParams.uuid);
      },

      reInitResource: function() {
        controllerScope.getModel().then(function(model) {
          controllerScope.model = model;
        }, function(error) {
          if (error.status == 404) {
            ncUtilsFlash.error('Resource is gone.');
            this.modelNotFound();
          }
        }.bind(this));
      },

      afterActivate: function() {
        this.updateMenu();
        this.setCounters();
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

      getCounters: function() {
        var query = angular.extend(alertsService.defaultFilter, {scope: this.model.url});
        return resourcesCountService.alerts(query).then(function(response) {
          return {alerts: response};
        });
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
