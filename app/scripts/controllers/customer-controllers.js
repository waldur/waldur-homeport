'use strict';

(function() {
    angular.module('ncsaas')
    .controller('CustomerListController', [
      'customersService',
      'baseControllerListClass',
      'usersService',
      'ENTITYLISTFIELDTYPES',
      '$rootScope',
      '$state',
      'ENV',
      'ncUtils',
      'currentStateService',
      CustomerListController
    ]);

  function CustomerListController(
    customersService,
    baseControllerListClass,
    usersService,
    ENTITYLISTFIELDTYPES,
    $rootScope,
    $state,
    ENV,
    ncUtils,
    currentStateService) {
    var controllerScope = this;
    var CustomerController = baseControllerListClass.extend({
      init:function() {
        this.service = customersService;
        this.controllerScope = controllerScope;
        this._super();
        this.searchFieldName = 'name';
        this.currentUser = usersService.currentUser;
        this.actionButtonsListItems = [
          {
            title: 'Remove',
            icon: 'fa-trash',
            clickFunction: this.remove.bind(controllerScope),

            isDisabled: function(customer) {
              return !this.isOwnerOrStaff(customer) || customer.projects.length != 0;
            }.bind(controllerScope),

            tooltip: function(customer) {
              if (!this.isOwnerOrStaff(customer)) {
                return 'Only owner or staff can remove organization';
              }
              if (customer.projects.length != 0) {
               return 'Organization has projects. Please remove them first';
              }
            }.bind(controllerScope),
          },
          {
            title: 'Add provider',
            icon: 'fa-plus',
            clickFunction: function(customer) {
              $rootScope.$broadcast('adjustCurrentCustomer', customer);
              $state.go('services.create')
            }
          }
        ];
        this.entityOptions = {
          entityData: {
            noDataText: 'You have no organizations yet.',
            noMatchesText: 'No organizations found matching filter.',
            title: 'Organizations',
            createLink: 'organizations.create',
            createLinkText: 'Add organization',
            rowTemplateUrl: 'views/customer/row.html'
          },
          list: [
            {
              name: 'Name',
              propertyName: 'name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'organizations.details({uuid: entity.uuid})',
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            }
          ]
        };
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('plans') == -1) {
          this.entityOptions.list.push({
            name: 'Plan',
            propertyName: 'plan_name',
            type: ENTITYLISTFIELDTYPES.noType,
            emptyText: 'No plan'
          });
        }
      },
      isOwnerOrStaff: function(customer) {
        if (this.currentUserIsStaff()) return true;
        for (var i = 0; i < customer.owners.length; i++) {
          if (this.currentUser.uuid === customer.owners[i].uuid) {
            return true;
          }
        }
      },
      currentUserIsStaff: function() {
        return this.currentUser.is_staff;
      },
      removeInstance: function(model) {
        currentStateService.setCustomer(null);
        return model.$delete().catch(function() {
          currentStateService.setCustomer(model);
        });
      },
      afterInstanceRemove: function(intance) {
        $rootScope.$broadcast('refreshCustomerList', {model: intance, remove: true});
        this._super(intance);
      },
      afterGetList: function() {
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('plans') == -1) {
          for (var i = 0; i < this.list.length; i++) {
            var item = this.list[i];
            if (item.plan) {
              item.plan_name = item.plan.name;
            }
          }
        }
        this.getQuotas();
        this._super();
      },
      getQuotas: function() {
        for (var i = 0; i < this.list.length; i++) {
          var item = this.list[i];
          item.quotas_usage = ncUtils.getQuotaUsage(item.quotas);
        }
      }
    });

    controllerScope.__proto__ = new CustomerController();

  }

  angular.module('ncsaas')
    .controller('CustomerDetailUpdateController', [
      'baseControllerDetailUpdateClass',
      'customersService',
      'customerImageService',
      'usersService',
      'ENV',
      '$stateParams',
      '$rootScope',
      '$scope',
      '$interval',
      '$timeout',
      '$q',
      'joinService',
      'ncUtilsFlash',
      'eventsService',
      'resourcesCountService',
      'currentStateService',
      CustomerDetailUpdateController
    ]);

  function CustomerDetailUpdateController(
    baseControllerDetailUpdateClass,
    customersService,
    customerImageService,
    usersService,
    ENV,
    $stateParams,
    $rootScope,
    $scope,
    $interval,
    $timeout,
    $q,
    joinService,
    ncUtilsFlash,
    eventsService,
    resourcesCountService,
    currentStateService
    ) {
    var controllerScope = this;
    var CustomerController = baseControllerDetailUpdateClass.extend({
      files: [],
      canEdit: false,
      showChart: false,

      init: function() {
        this.service = customersService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('refreshCounts', this.setCounters.bind(controllerScope));
        this._super();
        this.detailsState = 'organizations.details';
        this.currentUser = usersService.currentUser;
        this.detailsViewOptions = {
          title_plural: 'organizations',
          hasLogo: false,
          listState: 'organizations.list',
          aboutFields: [
            {
              fieldKey: 'name',
              isEditable: true,
              className: 'name',
              emptyText: 'Add name'
            },
            {
              fieldKey: 'contact_details',
              isEditable: true,
              className: 'details',
              emptyText: 'Add contact details'
            },
            {
              fieldKey: 'registration_code',
              isEditable: true,
              className: 'details',
              emptyText: 'Add registration code'
            }
          ],
          tabs: [
            {
              title: 'Events',
              key: 'eventlog',
              viewName: 'tabEventlog',
              icon: 'event',
              count: -1
            },
            {
              title: 'Alerts',
              key: 'alerts',
              viewName: 'tabAlerts',
              countFieldKey: 'alerts',
              icon: 'alerts'
            },
            {
              title: 'VMs',
              key: ENV.resourcesTypes.vms,
              viewName: 'tabResources',
              countFieldKey: 'vms',
              icon: 'resource'
            },
            {
              title: 'Applications',
              key: ENV.resourcesTypes.applications,
              viewName: 'tabApplications',
              countFieldKey: 'apps',
              icon: 'application'
            },
            {
              title: 'Projects',
              key: 'projects',
              viewName: 'tabProjects',
              countFieldKey: 'projects',
              icon: 'project'
            },
            {
              title: 'Providers',
              key: 'providers',
              viewName: 'tabServices',
              countFieldKey: 'services',
              icon: 'service'
            },
            {
              title: 'Billing',
              key: 'billing',
              viewName: 'tabBilling',
              hideSearch: true,
              icon: 'invoice',
              count: -1
            },
            {
              title: 'Team',
              key: 'team',
              viewName: 'tabTeam',
              hideSearch: false,
              countFieldKey: 'users',
              icon: 'customer'
            },
            {
              title: 'Manage',
              key: 'delete',
              viewName: 'tabDelete',
              hideSearch: true,
              icon: 'wrench'
            }
          ]
        };
        this.detailsViewOptions.activeTab = this.getActiveTab();
      },
      isOwnerOrStaff: function(customer) {
        if (this.currentUser.is_staff) return true;
        for (var i = 0; i < customer.owners.length; i++) {
          if (this.currentUser.uuid === customer.owners[i].uuid) {
            return true;
          }
        }
      },

      loadAll: function() {
        var deferred = $q.defer();
        this.getModel().then(function(customer) {
          $rootScope.$broadcast('adjustCurrentCustomer', customer);
          $timeout(function() {
            deferred.resolve();
          });
        });
        return deferred.promise;
      },

      afterActivate: function() {
        controllerScope.canEdit = controllerScope.isOwnerOrStaff(controllerScope.model);
        controllerScope.updateImageUrl();
        var vm = this;
        vm.setCounters();
        var timer = $interval(vm.setCounters.bind(vm), ENV.countersTimerInterval * 1000);
        $scope.$on('$destroy', function() {
          $interval.cancel(timer);
        });
      },

      getCounters: function() {
        return currentStateService.getCustomer().then(function(customer) {
          if (!customer) {
            return $q.reject();
          }
          var query = angular.extend(
              {UUID: customer.uuid},
              joinService.defaultFilter,
              eventsService.defaultFilter
          );
          return customersService.getCounters(query);
        });
      },

      // XXX: Avatar is temporarily disabled via detailsViewOptions.hasLogo = false
      // That's why following functions are not used: updateImageUrl, uploadImage, deleteImage
      updateImageUrl: function() {
        controllerScope.imageUrl = controllerScope.model.image || ENV.defaultCustomerIcon;
      },

      uploadImage: function() {
        customerImageService.create({
          uuid: controllerScope.model.uuid,
          file: controllerScope.files[0]
        }).then(function(response) {
          controllerScope.files = [];
          controllerScope.model.image = response.data.image;
          controllerScope.updateImageUrl();
          ncUtilsFlash.success('Organization image is uploaded');
        }, function(response) {
          ncUtilsFlash.warning('Unable to upload image');
        });
      },

      deleteImage: function() {
        controllerScope.model.image = null;
        customerImageService.delete({
          uuid: controllerScope.model.uuid
        }).then(function(response) {
          ncUtilsFlash.success('Organization image is deleted');
          controllerScope.model.image = null;
          controllerScope.updateImageUrl();
        }, function(response) {
          ncUtilsFlash.warning('Unable to delete image');
        });
      },
      editInPlace: function(data, fieldName) {
        var d = $q.defer();
        if (data || fieldName != 'name') {
          return this._super(data, fieldName);
        }
        d.resolve('This field is required.');
        return d.promise;
      },
      afterUpdate: function() {
        ncUtilsFlash.success('Organization {} is updated'.replace('{}', controllerScope.model.name));
        $rootScope.$broadcast('refreshCustomerList', {model: this.model, update: true});
      }
    });

    controllerScope.__proto__ = new CustomerController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('CustomerAddController',
    ['customersService', 'baseControllerAddClass', '$rootScope', CustomerAddController]);

  function CustomerAddController(customersService, baseControllerAddClass, $rootScope) {
    var controllerScope = this;
    var Controller = baseControllerAddClass.extend({
      init: function() {
        this.service = customersService;
        this.controllerScope = controllerScope;
        this._super();
        this.listState = 'organizations.list';
        this.detailsState = 'organizations.details';
        this.redirectToDetailsPage = true;
      },
      afterSave: function() {
        this._super();
        $rootScope.$broadcast('refreshCustomerList', {model: this.instance, new: true, current: true});
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();
