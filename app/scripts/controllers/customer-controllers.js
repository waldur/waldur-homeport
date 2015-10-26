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
      CustomerListController
    ]);

  function CustomerListController(
    customersService, baseControllerListClass, usersService, ENTITYLISTFIELDTYPES, $rootScope, $state, ENV) {
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
            clickFunction: function(customer) {
              $rootScope.$broadcast('adjustCurrentCustomer', customer);
              $state.go('services.create')
            }
          }
        ];
        this.entityOptions = {
          entityData: {
            noDataText: 'You have no organizations yet.',
            title: 'Organizations',
            createLink: 'organizations.create',
            createLinkText: 'Add organization'
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
      },
    });

    controllerScope.__proto__ = new CustomerController();

  }

  angular.module('ncsaas')
    .controller('CustomerDetailUpdateController', [
      'baseControllerDetailUpdateClass',
      'customersService',
      'customerImageService',
      'usersService',
      'paymentsService',
      'ENV',
      '$stateParams',
      '$rootScope',
      '$q',
      '$window',
      'servicesService',
      'resourcesCountService',
      'alertsService',
      'ncUtilsFlash',
      CustomerDetailUpdateController
    ]);

  function CustomerDetailUpdateController(
    baseControllerDetailUpdateClass,
    customersService,
    customerImageService,
    usersService,
    paymentsService,
    ENV,
    $stateParams,
    $rootScope,
    $q,
    $window,
    servicesService,
    resourcesCountService,
    alertsService,
    ncUtilsFlash
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
          title: 'Organization',
          hasLogo: true,
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
            }
          ],
          tabs: [
            {
              title: 'Events',
              key: 'eventlog',
              viewName: 'tabEventlog'
            },
            {
              title: 'Alerts',
              key: 'alerts',
              viewName: 'tabAlerts'
            },
            {
              title: 'VMs',
              key: ENV.resourcesTypes.vms,
              viewName: 'tabResources'
            },
            {
              title: 'Applications',
              key: ENV.resourcesTypes.applications,
              viewName: 'tabApplications'
            },
            {
              title: 'Projects',
              key: 'projects',
              viewName: 'tabProjects'
            },
            {
              title: 'Providers',
              key: 'providers',
              viewName: 'tabServices'
            }
          ]
        };
        this.detailsViewOptions.activeTab = this.getActiveTab(this.detailsViewOptions.tabs, $stateParams.tab);
      },
      isOwnerOrStaff: function(customer) {
        if (this.currentUser.is_staff) return true;
        for (var i = 0; i < customer.owners.length; i++) {
          if (this.currentUser.uuid === customer.owners[i].uuid) {
            return true;
          }
        }
      },

      afterActivate: function() {
        $rootScope.$broadcast('adjustCurrentCustomer', this.model);

        controllerScope.canEdit = controllerScope.isOwnerOrStaff(controllerScope.model);
        controllerScope.updateImageUrl();

        this.setCounters();
        this.service.getBalanceHistory(this.model.uuid).then(this.processChartData.bind(this));
      },

      setCounters: function() {
        this.setEventsCounter();
        this.setAlertsCounter();
        this.setVmCounter();
        this.setAppCounter();
        this.setProjectsCounter();
        this.setProvidersCounter();
      },
      setEventsCounter: function() {
        var vm = this;
        resourcesCountService.events({scope: vm.model.url}).then(function(count) {
          vm.detailsViewOptions.tabs[0].count = count;
        });
      },
      setAlertsCounter: function() {
        var vm = this;
        var query = angular.extend(alertsService.defaultFilter, {
          aggregate: 'customer',
          uuid: vm.model.uuid
        });
        resourcesCountService.alerts(query).then(function(count) {
          vm.detailsViewOptions.tabs[1].count = count;
        });
      },
      setVmCounter: function() {
        var vm = this;
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('resources') == -1) {
          vm.getResourceCount(ENV.VirtualMachines, vm.model.uuid).then(function(count) {
            vm.detailsViewOptions.tabs[2].count = count;
          });
        }
      },
      setAppCounter: function() {
        var vm = this;
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('resources') == -1) {
          vm.getResourceCount(ENV.Applications, vm.model.uuid).then(function(count) {
            vm.detailsViewOptions.tabs[3].count = count;
          });
        }
      },
      getResourceCount: function(category, customer_uuid) {
        return servicesService.getResourceTypes(category).then(function(types) {
          return resourcesCountService.resources({
            customer: customer_uuid,
            resource_type: types
          });
        });
      },
      setProjectsCounter: function() {
        var vm = this;
        resourcesCountService.projects({customer: vm.model.uuid}).then(function(count) {
          vm.detailsViewOptions.tabs[4].count = count;
        });
      },
      setProvidersCounter: function() {
        var vm = this;
        resourcesCountService.services({customer: vm.model.uuid}).then(function(count) {
          vm.detailsViewOptions.tabs[5].count = count;
        });
      },
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
      },

      addCredit: function(amount) {
        var vm = this;
        var payment = paymentsService.$create();
        payment.customer = vm.model.url;
        payment.amount = amount;
        return payment.$save(function(payment) {
          $window.location = payment.approval_url;
          return true;
        });
      },

      processChartData: function(rows) {
        this.showChart = rows.length > 0;

        var labels = rows.map(function(row) {
          return moment(row.created).format('D.MM');
        });
        var totals = rows.map(function(row) {
          return row.amount;
        });

        this.chartData = {
          labels: labels,
          datasets: [
            {
              label: "Balance",
              fillColor: "rgba(220,220,220,0.2)",
              strokeColor: "rgba(220,220,220,1)",
              pointColor: "rgba(220,220,220,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: totals
            }
          ]
        };
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
