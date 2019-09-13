import loadLeafleat from '@waldur/shims/load-leaflet';

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
  $sanitize,
  $q,
  $interval) {
  let ControllerListClass = baseControllerListClass.extend({
    init: function() {
      this.service = resourcesService;
      this.categories = {};
      this.categories[ENV.VirtualMachines] = 'vms';
      this.categories[ENV.PrivateClouds] = 'private_clouds';
      this.categories[ENV.Storages] = 'storages';
      this.categories[ENV.Volumes] = 'volumes';
      this.enableRefresh = true;

      let fn = this._super.bind(this);
      this.loadInitialContext().then(() => {
        this.tableOptions = this.getTableOptions();
        fn();
      });
      this.hasCustomFilters = false;
      this.resourceTimers = {};
    },
    $onDestroy: function() {
      angular.forEach(this.resourceTimers, timer => {
        $interval.cancel(timer);
      });
    },
    getTableOptions: function() {
      let vm = this.controllerScope;
      const options = {
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
              return $sanitize(row.service_name);
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
          let index = this.findIndexById(row);
          return `<span class="btn-group">` +
                 `<action-button-resource button-controller="controller" button-model="controller.list[${index}]"></action-button-resource>` +
                 `<resource-summary-button url="controller.list[${index}].url"></resource-summary-button>` +
                 `</span>`;
        }
      };
      if (this.currentUser.is_support && !this.currentUser.is_staff) {
        delete options.rowActions;
      }
      return options;
    },
    renderResourceName: function(row) {
      // Hack for datatables.net
      return this.renderComponent('resource-name', row) + `<span class="ng-hide">${row.name}</span>`;
    },
    renderResourceState: function(row) {
      // Hack for datatables.net
      return this.renderComponent('resource-state', row) + `<span class="ng-hide">${row.state}</span>`;
    },
    renderComponent: function(component, row) {
      const index = this.findIndexById(row);
      return `<${component} resource="controller.list[${index}]"></${component}>`;
    },
    getTableActions: function() {
      let actions = [];
      if (this.category !== undefined) {
        actions.push(this.getCreateAction());
      }
      if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('openMap') === -1) {
        actions.push(this.getMapAction());
      }
      return actions;
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
      } else if (this.category === ENV.Volumes) {
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
      'description', 'is_link_valid', 'customer_name', 'project_name',
      'marketplace_resource_uuid',
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
      let items = this.controllerScope.list.filter(function hasCoordinates(item) {
        return item.latitude !== null && item.longitude !== null;
      });

      let points = {};
      items.forEach(function groupMarkersByCoordinates(item) {
        let key = [item.latitude, item.longitude];
        if (!points[key]) {
          points[key] = [];
        }
        points[key].push(item);
      });

      let markers = [];
      angular.forEach(points, function createMarker(items) {
        let item = items[0];
        let message = items.map(function(item) {
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
      let markers = this.getMarkers();

      if(!markers) {
        alert('No virtual machines with coordinates.');
      } else {
        let scope = $rootScope.$new();
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
      for (let i = 0; i < project.services.length; i++) {
        let service = project.services[i];
        if (!service.shared) {
          return true;
        }
      }
      return false;
    },
    loadInitialContext: function() {
      return $q.all([
        currentStateService.getCustomer().then(customer => this.currentCustomer = customer),
        currentStateService.getProject().then(project => this.currentProject = project),
        usersService.getCurrentUser().then(user => this.currentUser = user)
      ]);
    },
    getList: function(filter) {
      let query = angular.extend({}, filter, {
        field: this.rowFields
      });
      if (angular.isDefined(this.category) && !this.getFilter().resource_type) {
        query.resource_category = this.getCategoryKey();
        this.updateFilters(filter);
      }
      return this._super(query);
    },
    updateFilters: function(filter) {
      let query = angular.extend({
        resource_category: this.getCategoryKey(),
        customer: currentStateService.getCustomerUuid()
      }, filter);
      angular.forEach(this.service.defaultFilter, function(val, key) {
        if (key !== 'resource_type') {
          query[key] = val;
        }
      });
      return resourcesService.countByType(query).then(function(counts) {
        this.searchFilters = this.getFilterByCounts(counts);
      }.bind(this));
    },
    getFilterByCounts: function(counts) {
      let filters = [];
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
      let vm = this;
      return resourcesService.$get(resource.resource_type, resource.uuid).then(function(response) {
        vm.setResource(resource, response);
        // when row is updated in the list it is not refreshed in the datatable. Do it manually.
        $rootScope.$broadcast('updateRow', {data:response});
        vm.afterGetList();
      });
    },
    setResource: function(resource, response) {
      let index = this.list.indexOf(resource);
      this.list[index] = response;
    },
    resourceIsUpdating: function(resource) {
      // resource is updating if it is not in stable state.
      return (resource.state !== 'OK' && resource.state !== 'Erred');
    },
    pollResource: function(resource) {
      let vm = this;
      function removeItem(collection, item) {
        // modify an object, not a reference.
        let index = collection.indexOf(item);
        if (index !== -1) {
          collection.splice(index, 1);
        }
      }
      function internalPollResource(resource) {
        let uuid = resource.uuid;

        if (vm.resourceTimers[resource.uuid]) {
          return;
        }

        vm.resourceTimers[resource.uuid] = $interval(() => {
          resourcesService.$get(resource.resource_type, uuid).then((response) => {
            // do not call updateRow as it reloads a table and actions are reloaded on ENV.singleResourcePollingTimeout
            vm.setResource(resource, response);
            if (!vm.resourceIsUpdating(response)) {
              $interval.cancel(vm.resourceTimers[uuid]);
              delete vm.resourceTimers[uuid];
              // update row only once to avoid table redrawing on each call.
              $rootScope.$broadcast('updateRow', {data:response});
              resourcesService.cleanOptionsCache(resource.url);
            }
          }).catch((response) => {
            $interval.cancel(vm.resourceTimers[uuid]);
            delete vm.resourceTimers[uuid];
            if (response.status === 404) {
              removeItem(vm.list, resource);
              $rootScope.$broadcast('removeRow', {data: uuid});
              $rootScope.$broadcast('refreshResource');
            }
          });
        }, ENV.singleResourcePollingTimeout);
      }
      return internalPollResource(resource);
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
