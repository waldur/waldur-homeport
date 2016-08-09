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
        var vm = this;
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
              type: ENTITYLISTFIELDTYPES.awesomeIcon,
              iconClass: 'fa-star-o',
              show: vm.isOwnerOrStaff.bind(controllerScope),
              name: 'Owner',
              className: 'customer-owner-icon',
              notSortable: true
            },
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
            emptyText: 'No plan',
            notSortable: true
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
      '$state',
      'ngDialog',
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
    currentStateService,
    $state,
    ngDialog
    ) {
    var controllerScope = this,
      timer,
      CustomerController = baseControllerDetailUpdateClass.extend({
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
              title: 'Team',
              key: 'team',
              viewName: 'tabTeam',
              hideSearch: false,
              countFieldKey: 'users',
              icon: 'customer'
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
              title: 'Sizing',
              key: 'sizing',
              viewName: 'tabSizing',
              icon: 'calculator',
              count: -1
            },
            {
              title: 'VMs',
              key: ENV.resourcesTypes.vms,
              viewName: 'tabResources',
              countFieldKey: 'vms',
              icon: 'resource'
            },
            {
              title: 'Private clouds',
              key: ENV.resourcesTypes.privateClouds,
              viewName: 'tabPrivateClouds',
              countFieldKey: 'private_clouds',
              icon: 'cloud'
            },
            {
              title: 'Applications',
              key: ENV.resourcesTypes.applications,
              viewName: 'tabApplications',
              countFieldKey: 'apps',
              icon: 'application'
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

      openDialog: function() {
        var dialogScope = $rootScope.$new();
        dialogScope.customer = controllerScope.model;
        var dialog = ngDialog.open({
          templateUrl: 'views/customer/edit-dialog.html',
          controller: 'CustomerEditDialogController',
          scope: dialogScope,
          className: 'ngdialog-theme-default'
        });
        dialog.closePromise.then(function(data) {
          if (data.value) {
            angular.extend(controllerScope.model, data.value);
          }
        });
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
        timer = $interval(vm.setCounters.bind(vm), ENV.countersTimerInterval * 1000);
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

      getCountersError: function() {
        $interval.cancel(timer);
        customersService.getPersonalOrFirstCustomer().then(function(customer) {
          $state.go('organizations.details', {uuid: customer.uuid});
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
      }
    });

    controllerScope.__proto__ = new CustomerController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('CustomerEditDialogController',
    ['customersService', '$scope', '$rootScope', '$state', 'ncUtilsFlash',
    CustomerEditDialogController]);

  function CustomerEditDialogController(customersService, $scope, $rootScope, $state, ncUtilsFlash) {
    angular.extend($scope, {
      fields: ['name', 'contact_details', 'registration_code', 'vat_code'],
      instance: {},
      init: function() {
        if (this.customer) {
          this.dialogTitle = 'Edit organization';
        } else {
          this.dialogTitle = 'Create organization';
        }

        if (this.customer) {
          this.copyFields(this.customer, this.instance, this.fields);
        }
        this.loadCountries();
      },
      loadCountries: function() {
        function find(list, predicate) {
          return (list.filter(predicate) || [])[0];
        }
        var vm = this;
        return customersService.loadCountries().then(function(countryChoices) {
          vm.countryChoices = countryChoices;
          vm.instance.country = find(countryChoices, function(country) {
            return country.value === vm.customer.country;
          });
        });
      },
      saveCustomer: function() {
        var vm = this;
        return vm.getPromise().then(function(customer) {
          customersService.clearAllCacheForCurrentEndpoint();
          $rootScope.$broadcast('refreshCounts');

          if (vm.customer.url) {
            ncUtilsFlash.success('Organization {} is updated'.replace('{}', customer.name));
            $rootScope.$broadcast('refreshCustomerList', {
              model: customer,
              update: true
            });
          } else {
            ncUtilsFlash.success('Organization has been created.');
            $rootScope.$broadcast('refreshCustomerList', {
              model: customer,
              new: true,
              current: true
            });
            $state.go('organizations.details', {uuid: customer.uuid});
          }

          vm.closeThisDialog(customer);
        });
      },
      getPromise: function() {
        if (this.customer.url) {
          return customersService.$update(null, this.customer.url, this.getOptions());
        } else {
          customer = customersService.$create();
          angular.extend(customer, this.getOptions());
          return customer.$save();
        }
      },
      copyFields: function(src, dest, names) {
        angular.forEach(names, function(name) {
          if (src[name]) {
            dest[name] = src[name];
          }
        });
      },
      getOptions: function() {
        var options = {};
        this.copyFields(this.instance, options, this.fields);
        if (this.instance.vat_code) {
          options.is_company = true;
        }
        if (this.instance.country) {
          options.country = this.instance.country.value;
        }
        return options;
      }
    });
    $scope.init();
  }
})();
