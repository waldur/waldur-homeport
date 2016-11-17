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
      '$uibModal',
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
    $uibModal,
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
            createLinkAction: this.openDialog,
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
              link: 'organization.details({uuid: entity.uuid})',
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
      openDialog: function() {
        $uibModal.open({
          templateUrl: 'views/customer/edit-dialog.html',
          controller: 'CustomerEditDialogController'
        })
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
          if (vm.customer) {
            vm.instance.country = find(countryChoices, function(country) {
              return country.value === vm.customer.country;
            });
          }
        });
      },
      saveCustomer: function() {
        var vm = this;
        return vm.getPromise().then(function(customer) {
          vm.errors = {};
          customersService.clearAllCacheForCurrentEndpoint();
          $rootScope.$broadcast('refreshCounts');

          if (vm.customer) {
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
            $state.go('organization.details', {uuid: customer.uuid});
          }

          vm.$close(customer);
        }, function(response) {
          vm.errors = response.data;
        });
      },
      getPromise: function() {
        if (this.customer) {
          return customersService.$update(null, this.customer.url, this.getOptions());
        } else {
          var customer = customersService.$create();
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


(function() {
  angular.module('ncsaas')
    .controller('CustomerDetailsController', CustomerDetailsController);

  CustomerDetailsController.$inject = [
    '$scope',
    'currentStateService',
    'joinService',
    'eventsService',
    'customersService',
    '$state',
    'tabCounterService',
    'AppStoreUtilsService'
  ];
  function CustomerDetailsController(
    $scope,
    currentStateService,
    joinService,
    eventsService,
    customersService,
    $state,
    tabCounterService,
    AppStoreUtilsService) {

    activate();

    function activate() {
      $scope.$on('currentCustomerUpdated', function() {
        refreshCustomer();
      });
      refreshCustomer();
    }

    function setItems() {
      $scope.items = [
        {
          label: "Dashboard",
          icon: "fa-th-large",
          link: "dashboard.index"
        },
        {
          label: "Providers",
          icon: "fa-database",
          link: "organization.providers({uuid: $ctrl.context.customer.uuid})",
          feature: "providers",
          countFieldKey: "services"
        },
        {
          label: "Projects",
          icon: "fa-bookmark",
          link: "organization.projects({uuid: $ctrl.context.customer.uuid})",
          feature: "projects",
          countFieldKey: "projects"
        },
        {
          icon: "fa-shopping-cart",
          label: "Service store",
          feature: "appstore",
          action: AppStoreUtilsService.openDialog.bind(null, {selectProject: true}),
        },
        {
          label: "Analytics",
          icon: "fa-bar-chart-o",
          link: "organization.analysis",
          children: [
            {
              label: "Cost analysis",
              icon: "fa-pie-chart",
              link: "organization.analysis.cost({uuid: $ctrl.context.customer.uuid})"
            },
            {
              label: "Resource usage",
              icon: "fa-tachometer",
              link: "organization.analysis.resources({uuid: $ctrl.context.customer.uuid})"
            }
          ]
        },
        {
          label: "Audit logs",
          icon: "fa-bell-o",
          link: "organization.details({uuid: $ctrl.context.customer.uuid})",
          feature: "eventlog"
        },
        {
          label: "Alerts",
          icon: "fa-fire",
          link: "organization.alerts({uuid: $ctrl.context.customer.uuid})",
          feature: "alerts",
          countFieldKey: "alerts"
        },
        {
          label: "Team",
          icon: "fa-group",
          link: "organization.team.tabs({uuid: $ctrl.context.customer.uuid})",
          feature: "team",
          countFieldKey: "users"
        },
        {
          label: "Billing",
          icon: "fa-file-text-o",
          link: "organization.billing.tabs({uuid: $ctrl.context.customer.uuid})",
          feature: "billing"
        },
        {
          label: "Sizing",
          icon: "fa-calculator",
          link: "organization.sizing({uuid: $ctrl.context.customer.uuid})",
          feature: "sizing"
        },
        {
          label: 'Manage',
          icon: 'fa-wrench',
          link: 'organization.delete({uuid: $ctrl.context.customer.uuid})'
        }
      ];
    }

    function refreshCustomer() {
      currentStateService.isCustomerDefined && currentStateService.getCustomer().then(function(customer) {
        $scope.currentCustomer = customer;
        $scope.context = {customer: customer};
        setItems();
        connectCounters(customer);
      });
    }

    function connectCounters(customer) {
      if ($scope.timer) {
        tabCounterService.cancel($scope.timer);
      }

      $scope.timer = tabCounterService.connect({
        $scope: $scope,
        tabs: $scope.items,
        getCounters: getCounters.bind(null, customer),
        getCountersError: getCountersError
      });
    }

    function getCounters(customer) {
      var query = angular.extend(
          {UUID: customer.uuid},
          joinService.defaultFilter,
          eventsService.defaultFilter
      );
      return customersService.getCounters(query);
    }

    function getCountersError(error) {
      if (error.status == 404) {
        customersService.getPersonalOrFirstCustomer().then(function(customer) {
          $state.go('organization.details', {uuid: customer.uuid});
        });
      } else {
        tabCounterService.cancel($scope.timer);
      }
    }
  }
})();
