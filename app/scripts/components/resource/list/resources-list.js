import loadLeafleat from '../../../shims/load-leaflet';

// @ngInject
export default function baseResourceListController(
  baseControllerListClass,
  ENV,
  resourcesService,
  priceEstimationService,
  servicesService,
  currentStateService,
  usersService,
  projectsService,
  ResourceProvisionPolicy,
  $uibModal,
  $ocLazyLoad,
  $rootScope,
  $state,
  $q,
  $timeout,
  resourceUtils,
  ncUtils) {
  var ControllerListClass = baseControllerListClass.extend({
    init: function() {
      this.service = resourcesService;
      this.categories = {};
      this.categories[ENV.VirtualMachines] = 'vms';
      this.categories[ENV.PrivateClouds] = 'private_clouds';
      this.categories[ENV.Storages] = 'storages';
      this.enableRefresh = true;

      this._super();
      this.hasCustomFilters = false;
    },
    getTableOptions: function() {
      var vm = this.controllerScope;
      return {
        searchFieldName: 'name',
        noDataText: gettext('You have no resources yet.'),
        noMatchesText: gettext('No resources found matching filter.'),
        enableOrdering: true,
        columns: [
          {
            id: 'name',
            title: gettext('Name'),
            className: 'all',
            orderField: 'name',
            render: function(row) {
              return vm.renderResourceName(row);
            }
          },
          {
            id: 'provider',
            title: gettext('Provider'),
            className: 'desktop',
            orderField: 'service_name',
            render: function(row) {
              return row.service_name;
            }
          },
          {
            id: 'state',
            title: gettext('State'),
            className: 'min-tablet-l',
            orderField: 'state',
            render: function(row) {
              return vm.renderResourceState(row);
            }
          },
        ],
        tableActions: this.getTableActions(),
        rowActions: function(row) {
          var index = this.findIndexById(row);
          return '<action-button-resource button-controller="controller" button-model="controller.list[' + index + ']"/>';
        }
      };
    },
    renderResourceName: function(row) {
      var index = this.findIndexById(row);
      return '<resource-name resource="controller.list[{index}]"></resource-name>'
        .replace('{index}', index);
    },
    renderResourceState: function(row) {
      var index = this.findIndexById(row);
      return '<resource-state resource="controller.list[{index}]"></resource-state>'
        .replace('{index}', index);
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
        tooltip = gettext('Quota has been reached.');
      } else if (!this.projectHasNonSharedService(this.currentProject)) {
        disabled = true;
        tooltip = gettext('Import is not possible as there are no personal provider accounts registered.');
      } else {
        disabled = false;
        tooltip = gettext('Import resources from the registered provider accounts.');
      }
      return {
        title: this.getImportTitle(),
        iconClass: 'fa fa-plus',
        callback: function() {
          $state.go('import.import');
        },
        disabled: disabled,
        titleAttr: tooltip
      };
    },
    getImportTitle: function() {
      return gettext('Import');
    },
    getCreateAction: function() {
      const { disabled, errorMessage } = ResourceProvisionPolicy.checkResource(
        this.currentUser, this.currentCustomer, this.currentProject, this.getCategoryKey()
      );
      return {
        title: this.getCreateTitle(),
        iconClass: 'fa fa-plus',
        callback: function() {
          this.gotoAppstore();
        }.bind(this),
        disabled: disabled,
        titleAttr: errorMessage
      };
    },
    getCreateTitle: function() {
      return gettext('Create');
    },
    gotoAppstore: function() {
      $state.go(this.getCategoryState(), {
        uuid: this.currentProject.uuid
      });
    },
    getCategoryKey: function() {
      return this.categories[this.category];
    },
    getCategoryState: function() {
      if (this.category === ENV.VirtualMachines) {
        return 'appstore.vms';
      } else if (this.category === ENV.PrivateClouds) {
        return 'appstore.private_clouds';
      } else if (this.category === ENV.Storages) {
        return 'appstore.storages';
      }
    },
    getMapAction: function() {
      return {
        title: gettext('Open map'),
        iconClass: 'fa fa-map-marker',
        callback: this.openMap.bind(this)
      };
    },
    rowFields: [
      'uuid', 'url', 'name', 'state', 'runtime_state', 'created', 'error_message',
      'resource_type', 'latitude', 'longitude',
      'service_name', 'service_uuid', 'customer', 'service_settings_state',
      'service_settings_error_message', 'service_settings_uuid', 'security_groups',
      'description', 'is_link_valid', 'customer_name', 'project_name'
    ],
    addRowFields: function(fields) {
      for (let i = 0; i < fields.length; i++) {
        let field = fields[i];
        if (this.rowFields.indexOf(field) === -1) {
          this.rowFields.push(field);
        }
      }
    },
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
        alert('No virtual machines with coordinates.');
      } else {
        var scope = $rootScope.$new();
        scope.markers = markers;
        loadLeafleat().then(module => {
          $ocLazyLoad.load({name: module.default});
          // eslint-disable-next-line no-undef
          scope.maxbounds = new L.LatLngBounds(markers);
          $uibModal.open({
            template: '<leaflet width="100%" markers="markers" maxbounds="maxbounds"></leaflet>',
            windowClass: 'map-dialog',
            scope: scope
          });
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
        }),
        usersService.getCurrentUser().then(function(user) {
          vm.currentUser = user;
        })
      ]).then(function() {
        vm.tableOptions = vm.getTableOptions();
        var query = angular.extend({}, filter, {
          field: vm.rowFields
        });
        if (angular.isDefined(vm.category) && !vm.getFilter().resource_type) {
          query.resource_category = vm.getCategoryKey();
          vm.updateFilters(filter);
        }
        return fn(query);
      });
    },
    updateFilters: function(filter) {
      var query = angular.extend({
        resource_category: this.getCategoryKey(),
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
            title: resourceType.replace('.', ' ') + ' (' + count + ')',
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
      this.pollResources();
    },
    afterInstanceRemove: function(resource) {
      this._super(resource);
      servicesService.clearAllCacheForCurrentEndpoint();
      projectsService.clearAllCacheForCurrentEndpoint();
      priceEstimationService.clearAllCacheForCurrentEndpoint();
    },
    reInitResource:function(resource) {
      var vm = this;
      return resourcesService.$get(resource.resource_type, resource.uuid).then(function(response) {
        vm.setResource(resource, response);
        // when row is updated in the list it is not refreshed in the datatable. Do it manually.
        $rootScope.$broadcast('updateRow', {data:response});
        vm.afterGetList();
      });
    },
    setResource: function(resource, response) {
      var index = this.list.indexOf(resource);
      this.list[index] = response;
    },
    resourceIsUpdating: function(resource) {
      // resource is updating if it is not in stable state.
      return (resource.state !== 'OK' && resource.state !== 'Erred');
    },
    pollResource: function(resource) {
      let vm = this;
      vm.monitoredResources = vm.monitoredResources || [];
      function removeItem(collection, item) {
        // modify an object, not a reference.
        let index = collection.indexOf(item);
        if (index !== -1) {
          collection.splice(index, 1);
        }
      }
      function internalPollResource(resource) {
        let uuid = resource.uuid;

        $timeout(() => {
          resourcesService.$get(resource.resource_type, uuid).then((response) => {
            // do not call updateRow as it reloads a table and actions are reloaded on ENV.singleResourcePollingTimeout
            vm.setResource(resource, response);
            if (vm.resourceIsUpdating(response)) {
              internalPollResource(resource);
            } else {
              // update row only once to avoid table redrawing on each call.
              $rootScope.$broadcast('updateRow', {data:response});
              resourcesService.cleanOptionsCache(resource.url);
              removeItem(vm.monitoredResources, uuid);
            }
          }).catch((response) => {
            if (response.status === 404) {
              removeItem(vm.list, resource);
              $rootScope.$broadcast('removeRow', {data: uuid});
            }
            removeItem(vm.monitoredResources, uuid);
          });
        }, ENV.singleResourcePollingTimeout);
      }

      if (vm.monitoredResources.indexOf(resource.uuid) === -1) {
        vm.monitoredResources.push(resource.uuid);
        internalPollResource(resource);
      }
    },
    pollResources: function() {
      if (!ENV.resourcePollingEnabled) {
        return;
      }
      let vm = this;

      let newResources = this.list.filter(vm.resourceIsUpdating);
      angular.forEach(newResources, (resource) => {
        vm.pollResource(resource);
      });
    }
  });

  return ControllerListClass;
}
