(function() {
  angular.module('ncsaas')
    .controller('CustomerProjectTabController', ProjectListController);

  ProjectListController.$inject = [
    'baseControllerListClass',
    'projectsService',
    'customersService',
    'ENV',
    '$filter',
    '$q',
    '$state',
    '$scope',
    '$timeout',
    'ncUtils',
    'currentStateService',
    'usersService'
  ];

  function ProjectListController(
    baseControllerListClass,
    projectsService,
    customersService,
    ENV,
    $filter,
    $q,
    $state,
    $scope,
    $timeout,
    ncUtils,
    currentStateService,
    usersService) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      init: function() {
        this.service = projectsService;
        this._super();
        this.activate();
        $scope.$on('currentCustomerUpdated', function(event, customer) {
          $timeout(function() {
            controllerScope.resetCache();
          });
        });
      },
      activate: function() {
        var vm = this;
        vm.loading = true;
        $q.all([
          currentStateService.getCustomer().then(function(customer) {
            vm.currentCustomer = customer;
          }),
          usersService.getCurrentUser().then(function(user) {
            vm.currentUser = user;
          })
        ]).finally(function() {
          vm.loading = false;
        }).then(function() {
          vm.tableOptions = {
            searchFieldName: 'name',
            noDataText: 'You have no projects yet.',
            noMatchesText: 'No projects found matching filter.',
            columns: vm.getColumns(),
            tableActions: vm.getTableActions()
          };
        });
      },
      getColumns: function() {
        var columns = [
          {
            title: 'Name',
            render: function(data, type, row, meta) {
              var href = $state.href('project.details', {uuid: row.uuid});
              return "<a href=\"{href}\">{name}</a>"
                     .replace('{href}', href)
                     .replace('{name}', row.name);
            }
          },
          {
            title: 'Creation date',
            render: function(data, type, row, meta) {
              return $filter('dateTime')(row.created);
            }
          }
        ];
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('resources') == -1) {
          columns.push({
            title: 'VMs',
            render: function(data, type, row, meta) {
              return row.vm_count || 0;
            }
          });
          columns.push({
            title: 'Storage',
            render: function(data, type, row, meta) {
              return row.storage_count || 0;
            }
          });
          columns.push({
            title: 'Apps',
            render: function(data, type, row, meta) {
              return row.app_count || 0;
            }
          });
          columns.push({
            title: 'Private clouds',
            render: function(data, type, row, meta) {
              return row.private_cloud_count || 0;
            }
          });
        }
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('premiumSupport') == -1) {
          columns.push({
            title: 'SLA',
            render: function(data, type, row, meta) {
              if (row.plan) {
                return row.plan.name;
              } else if (row.has_pending_contracts) {
                return 'Pending';
              } else {
                return 'No plan';
              }
            }
          });
        }
        return columns;
      },
      getTableActions: function() {
        var vm = this;
        var ownerOrStaff = customersService.checkCustomerUser(vm.currentCustomer, vm.currentUser);
        var quotaReached = ncUtils.isCustomerQuotaReached(vm.currentCustomer, 'project');
        var title;
        if (!ownerOrStaff) {
          title = "You don't have enough privileges to perform this operation";
        } else if (quotaReached) {
          title = "Quota has been reached";
        }
        return [
          {
            name: '<i class="fa fa-plus"></i> Add project',
            callback: function() {
              $state.go('project-create');
            },
            disabled: !ownerOrStaff || quotaReached,
            titleAttr: title
          }
        ];
      },
      afterGetList: function() {
        for (var i = 0; i < this.list.length; i++) {
          var item = this.list[i];
          this.setProjectCounters(item);
        }
        this._super();
      },
      setProjectCounters: function(project) {
        for (var i = 0; i < project.quotas.length; i++) {
          var quota = project.quotas[i];
          if (quota.name == 'nc_app_count') {
            project.app_count = quota.usage;
          } else if (quota.name == 'nc_vm_count') {
            project.vm_count = quota.usage;
          } else if (quota.name == 'nc_private_cloud_count') {
            project.private_cloud_count = quota.usage;
          } else if (quota.name == 'nc_storage_count') {
            project.storage_count = quota.usage;
          }
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('CustomerAlertsListController', [
      'BaseAlertsListController',
      'currentStateService',
      CustomerAlertsListController]);

  function CustomerAlertsListController(BaseAlertsListController, currentStateService) {
    var controllerScope = this;
    var controllerClass = BaseAlertsListController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this._super();
      },
      getList: function(filter) {
        var vm = this;
        var fn = this._super.bind(vm);
        filter = filter || {};
        return currentStateService.getCustomer().then(function(customer) {
          vm.service.defaultFilter.aggregate = 'customer';
          vm.service.defaultFilter.uuid = customer.uuid;
          return fn(filter);
        })
      }
    });

    controllerScope.__proto__ = new controllerClass();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('CustomerEventTabController', [
      'baseEventListController',
      'currentStateService',
      CustomerEventTabController
    ]);

  function CustomerEventTabController(baseEventListController, currentStateService) {
    var controllerScope = this;
    var EventController = baseEventListController.extend({

      init: function() {
        this.controllerScope = controllerScope;
        this._super();
      },

      getList: function(filter) {
        var vm = this,
          fn = this._super.bind(vm);
        return currentStateService.getCustomer().then(function(customer) {
          vm.service.defaultFilter.scope = customer.url;
          return fn(filter);
        });
      }
    });

    controllerScope.__proto__ = new EventController();
  }

})();

(function() {
  angular.module('ncsaas')
      .controller('CustomerAgreementsTabController', [
        'baseControllerListClass',
        'agreementsService',
        'ENTITYLISTFIELDTYPES',
        CustomerAgreementsTabController
      ]);

  function CustomerAgreementsTabController(
    baseControllerListClass,
    agreementsService,
    ENTITYLISTFIELDTYPES) {
    var controllerScope = this;
    var AgreementsController = baseControllerListClass.extend({
      init: function() {
        this.service = agreementsService;
        this._super();

        this.entityOptions = {
          entityData: {
            noDataText: 'No plans yet',
            hideTableHead: false,
            rowTemplateUrl: 'views/payment/agreement.html'
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.colorState,
              propertyName: 'state',
              className: 'visual-status',
              getClass: function(state) {
                if (state == 'active') {
                  return 'status-circle online';
                } else {
                  return 'status-circle offline';
                }
              }
            },
            {
              name: 'Plan name',
              propertyName: 'plan_name',
            },
            {
              name: 'Date',
              propertyName: 'created',
              type: ENTITYLISTFIELDTYPES.dateShort,
            },
            {
              name: 'Monthly price',
              propertyName: 'plan_price',
              type: ENTITYLISTFIELDTYPES.currency
            }
          ]
        };
      }
    });

    controllerScope.__proto__ = new AgreementsController();
  }

})();


(function() {
  angular.module('ncsaas')
      .controller('CustomerPaymentsTabController', [
        'baseControllerListClass',
        'paymentsService',
        'ENTITYLISTFIELDTYPES',
        'ENV',
        CustomerPaymentsTabController
      ]);

  function CustomerPaymentsTabController(
    baseControllerListClass,
    paymentsService,
    ENTITYLISTFIELDTYPES,
    ENV) {
    var controllerScope = this;
    var PaymentsController = baseControllerListClass.extend({
      defaultErrorMessage: ENV.defaultErrorMessage,
      init: function() {
        this.service = paymentsService;
        this._super();

        this.entityOptions = {
          entityData: {
            noDataText: 'No payments yet',
            hideTableHead: false,
            rowTemplateUrl: 'views/payment/row.html',
            expandable: true
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.colorState,
              propertyName: 'state',
              className: 'visual-status',
              getClass: function(state) {
                var classes = {
                  Erred: 'erred',
                  Approved: 'online',
                  Created: 'processing',
                  Cancelled: 'offline'
                };
                var cls = classes[state];
                if (cls == 'processing') {
                  return 'icon fa-refresh fa-spin';
                } else {
                  return 'status-circle ' + cls;
                }
              }
            },
            {
              name: 'Type',
              propertyName: 'type'
            },
            {
              name: 'Date',
              propertyName: 'created',
              type: ENTITYLISTFIELDTYPES.dateShort,
            },
            {
              name: 'Amount',
              propertyName: 'amount',
              type: ENTITYLISTFIELDTYPES.currency
            }
          ]
        };
        this.expandableOptions = [
          {
            isList: false,
            addItemBlock: false,
            viewType: 'payment'
          }
        ];
      },
      afterGetList: function() {
        this._super();
        angular.forEach(this.list, function(payment) {
          payment.type = 'PayPal';
        });
      }
    });

    controllerScope.__proto__ = new PaymentsController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('CustomerDeleteTabController', [
      'baseControllerClass',
      'customersService',
      'paymentDetailsService',
      'usersService',
      'currentStateService',
      '$state',
      '$q',
      'ENV',
      CustomerDeleteTabController
    ]);

  function CustomerDeleteTabController(
    baseControllerClass,
    customersService,
    paymentDetailsService,
    usersService,
    currentStateService,
    $state,
    $q,
    ENV
  ) {
    var controllerScope = this;
    var DeleteController = baseControllerClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this._super();
        this.paymentDetails = null;
        this.loadInitial();
      },
      loadInitial: function() {
        var vm = this;
        vm.loading = true;
        return currentStateService.getCustomer().then(function(customer) {
          vm.customer = customer;
          vm.getPaymentDetails();
          return vm.checkCanRemoveCustomer(customer).then(function(result) {
            vm.canRemoveCustomer = result;
          });
        }).finally(function() {
          vm.loading = false;
        });
      },
      getPaymentDetails: function() {
        var vm = this;
        paymentDetailsService.getList({
          customer_uuid: vm.customer.uuid
        }).then(function(result) {
          if (result) {
            vm.paymentDetails = result[0];
          }
        });
      },
      checkCanRemoveCustomer: function(customer) {
        return usersService.getCurrentUser().then(function(user) {
          if (user.is_staff) {
            return $q.when(true);
          }
          for (var i = 0; i < customer.owners.length; i++) {
            if (user.uuid === customer.owners[i].uuid) {
              return $q.when(ENV.ownerCanManageCustomer);
            }
          }
          return $q.when(false);
        });
      },
      removeCustomer: function() {
        var vm = this;
        if (this.customer.projects.length > 0) {
          return $state.go('support.create', {type: 'remove_customer'});
        }
        var confirmDelete = confirm('Confirm deletion?');
          if (confirmDelete) {
          currentStateService.setCustomer(null);
          this.customer.$delete().then(function(instance) {
            customersService.clearAllCacheForCurrentEndpoint();
            customersService.getPersonalOrFirstCustomer(instance.name).then(function(customer) {
              currentStateService.setCustomer(customer);
              $state.go('organization.details', {uuid: customer.uuid});
            });
          }, function() {
            currentStateService.setCustomer(vm.customer);
          });
        }
      }
    });

    controllerScope.__proto__ = new DeleteController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('CustomerSizingTabController', [
      'baseControllerClass',
      CustomerSizingTabController
    ]);

  function CustomerSizingTabController(
    baseControllerClass
  ) {
    var controllerScope = this;
    var SizingController = baseControllerClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this._super();
        this.list = [
          {
            name: 'Monator offer',
            email: 'john@monator.com',
            views: [],
            provider: {}
          },
          {
            name: 'Webapp for Monster Inc.',
            email: 'john@monator.com',
            views: [],
            provider: {}
          },
          {
            name: 'Webapp for Monster Inc.',
            email: 'john@monator.com',
            views: [],
            provider: {}
          }
        ];
      },
      calculate: function(item) {
        var price = 0;
        if (item.provider.price) {
          item.views.forEach(function(view) {
            price += view.count * item.provider.price;
          });
        }
        return price;
      }
    });

    controllerScope.__proto__ = new SizingController();
  }

})();
