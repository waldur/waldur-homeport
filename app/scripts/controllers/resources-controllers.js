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
    'ngDialog',
    '$rootScope',
    'resourceUtils',
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
    ngDialog,
    $rootScope,
    resourceUtils) {
    var ControllerListClass = baseControllerListClass.extend({
      init: function() {
        this.service = resourcesService;
        this.blockUIElement = 'tab-content';
        this._super();
        this.searchFieldName = 'name';
        this.selectAll = true;
        this.hasCustomFilters = false;
        var currentCustomerUuid = currentStateService.getCustomerUuid();
        var vm = this;
        this.entityOptions = {
          entityData: {
            noDataText: 'You have no resources yet.',
            noMatchesText: 'No resources found matching filter.',
            checkQuotas: 'resource',
            timer: ENV.resourcesTimerInterval,
            rowTemplateUrl: 'views/resource/row.html',
            actionButtonsType: 'resource'
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.icon,
              className: 'icon',
              getTitle: function(item) {
                return item.resource_type;
              },
              getIcon: function(item) {
                var service_type = item.resource_type.split(".")[0];
                return "/static/images/appstore/icon-" + service_type.toLowerCase() + ".png";
              }
            },
            {
              name: 'Name',
              propertyName: 'name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'resources.details({uuid: entity.uuid, resource_type: entity.resource_type})',
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
              getClass: function(state) {
                var cls = ENV.resourceStateColorClasses[state];
                if (cls == 'processing') {
                  return 'icon refresh spin';
                } else {
                  return 'status-circle ' + cls;
                }
              }
            }
          ]
        };
        this.expandableOptions = [
          {
            isList: false,
            addItemBlock: false,
            viewType: 'resource'
          }
        ];

        currentStateService.getProject().then(function(project) {
          if (project) {
            if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('resources') == -1) {
              vm.entityOptions.entityData.createLink = 'appstore.store';
              vm.entityOptions.entityData.createLinkText = 'Add';
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
      rowFields: [
        'uuid', 'url', 'name', 'state', 'created', 'start_time', 'error_message',
        'resource_type', 'latitude', 'longitude', 'access_url',
        'service_name', 'service_type', 'service_uuid', 'related_resources'
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
          ngDialog.open({
            template: '<leaflet width="100%" markers="markers" maxbounds="maxbounds"></leaflet>',
            plain: true,
            className: 'ngdialog-theme-default map-dialog',
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
        filter = filter || {};
        var fn = this._super.bind(this);
        return this.adjustSearchFilters().then(function() {
          angular.extend(filter, {field: vm.rowFields});
          return fn(filter);
        });
      },
      afterGetList: function() {
        angular.forEach(this.list, function(resource) {
          resourcesService.cleanOptionsCache(resource.url);
        });
        this._super();
      },
      adjustSearchFilters: function() {
        var vm = this,
          resourcesCounts = null;

        if (!this.hasCustomFilters) {
          vm.service.defaultFilter.resource_type = [];
        }

        return servicesService.getResourceTypes(vm.category).then(function(types) {
          if (!vm.hasCustomFilters) {
            vm.service.defaultFilter.resource_type = types;
          }
          vm.types = angular.copy(vm.service.defaultFilter);
          vm.types.resource_type = types;
        }).then(function() {
          return resourcesService.countByType(vm.types);
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
        '$interval',
        'ENV',
        'resourcesService',
        'resourcesCountService',
        'resourceUtils',
        'alertsService',
        'servicesService',
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
    resourceUtils,
    alertsService,
    servicesService,
    baseControllerDetailUpdateClass,
    currentStateService) {
    var controllerScope = this;
    var Controller = baseControllerDetailUpdateClass.extend({
      canEdit: true,
      defaultErrorMessage: "Reason unknown, please contact support",

      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this._super();
        this.detailsViewOptions = {
          title_plural: 'resources',
          listState: 'projects.details({uuid: controller.model.project_uuid, tab:controller.resourceTab})',
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
              title: 'Backups',
              key: 'backups',
              viewName: 'tabBackups',
              count: 0
            },
            {
              title: 'Alerts',
              key: 'alerts',
              viewName: 'tabAlerts',
              countFieldKey: 'alerts'
            }
          ]
        };
        this.detailsViewOptions.activeTab = this.getActiveTab();
      },

      getModel: function() {
        return this.service.$get($stateParams.resource_type, $stateParams.uuid);
      },

      afterActivate: function() {
        this.setCounters();
        this.updateResourceTab();
        this.scheduleRefresh();
      },

      updateResourceTab: function() {
        var service_type = this.model.resource_type.split(".")[0];
        var vm_services = servicesService.getServiceTypes(ENV.VirtualMachines);
        var app_services = servicesService.getServiceTypes(ENV.Applications);
        if (vm_services.indexOf(service_type) > -1) {
          this.resourceTab = ENV.resourcesTypes.vms;
        } else if (app_services.indexOf(service_type) > -1) {
          this.resourceTab = ENV.resourcesTypes.applications;
        }
      },

      getCounters: function() {
        var query = angular.extend(alertsService.defaultFilter, {scope: this.model.url});
        return resourcesCountService.alerts(query).then(function(response) {
          return {alerts: response};
        });
      },

      scheduleRefresh: function() {
        var vm = this;
        vm.updateStatus();

        var refreshPromise = $interval(function() {
          vm.getModel().then(function(model) {
            vm.model = model;
            vm.updateStatus();
          });
        }, ENV.resourcesTimerInterval * 1000);

        $scope.$on('$destroy', function() {
          $interval.cancel(refreshPromise);
        });
      },
      updateStatus: function() {
        this.inProgress = (ENV.resourceStateColorClasses[this.model.state] === 'processing');
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
