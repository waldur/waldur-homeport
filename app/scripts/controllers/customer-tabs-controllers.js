(function() {
  angular.module('ncsaas')
    .controller('CustomerServiceTabController', [
      '$stateParams',
      '$location',
      'baseServiceListController',
      'joinService',
      'ENV',
      CustomerServiceTabController
    ]);

  function CustomerServiceTabController(
    $stateParams,
    $location,
    baseServiceListController,
    joinService,
    ENV) {
    var controllerScope = this;
    var Controller = baseServiceListController.extend({
      defaultErrorMessage: "Reason unknown, please contact support",

      init: function() {
        this.controllerScope = controllerScope;
        this.service = joinService;
        this.service.defaultFilter.customer = $stateParams.uuid;
        this.expandableOptions = [
          {
            isList: false,
            addItemBlock: false,
            viewType: 'service',
            title: 'Settings'
          }
        ];
        this.blockUIElement = 'tab-content';
        this._super();
        this.entityOptions.list[0].type = 'editable';
        this.entityOptions.entityData.expandable = true;
      },
      getClass: function(state) {
        return ENV.servicesStateColorClasses[state];
      },
      afterGetList: function() {
        this.expandSelectedItem();
      },
      afterInstanceRemove: function(instance) {
        this._super(instance);
        $location.search({'tab': 'providers'});
      },
      expandSelectedItem: function() {
        var vm = this;
        var service_type = $stateParams.providerType;
        var uuid = $stateParams.providerUuid;

        if (service_type && uuid) {
          var item = vm.findItem(service_type, uuid);
          if (item) {
            // Move found element to the start of the list for user's convenience
            vm.list.splice(vm.list.indexOf(item), 1);
            vm.list.unshift(item);
            if (angular.isUndefined(item.expandItemOpen)) {
              item.expandItemOpen = true;
            }
          } else {
            this.service.$get(service_type, uuid).then(function(provider) {
              vm.list.unshift(provider);
              if (angular.isUndefined(provider.expandItemOpen)) {
                provider.expandItemOpen = true;
              }
            });
          }
        }
      },
      findItem: function(service_type, uuid) {
        for (var i = 0; i < this.list.length; i++) {
          var item = this.list[i];
          if (item.uuid == uuid && item.service_type == service_type) {
            return item;
          }
        }
      }
    });
    controllerScope.__proto__ = new Controller();
  }
})();

(function() {

  angular.module('ncsaas')
    .controller('CustomerProjectTabController', [
      'BaseProjectListController', CustomerProjectTabController]);

  function CustomerProjectTabController(BaseProjectListController) {
    var controllerScope = this;
    var Controller = BaseProjectListController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.blockUIElement = 'tab-content';
        this._super();
        this.entityOptions.entityData.title = '';
        this.entityOptions.entityData.checkQuotas = 'project';
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();

(function() {
  angular.module('ncsaas')
    .service('BaseCustomerResourcesTabController', [
      '$stateParams',
      'baseResourceListController',
      'ENTITYLISTFIELDTYPES',
      BaseCustomerResourcesTabController]);

  function BaseCustomerResourcesTabController(
    $stateParams,
    baseResourceListController,
    ENTITYLISTFIELDTYPES
  ) {

    var controllerClass = baseResourceListController.extend({
      init:function() {
        this._super();
        this.service.defaultFilter.customer = $stateParams.uuid;
        this.entityOptions.list.push({
          name: 'Project',
          propertyName: 'project_name',
          link: 'projects.details({uuid: entity.project_uuid})',
          type: ENTITYLISTFIELDTYPES.name
        });
        this.rowFields.push('project_name');
        this.rowFields.push('project_uuid');
      }
    });
    return controllerClass;
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('CustomerResourcesTabController', [
      'BaseCustomerResourcesTabController', 'ENV',
      CustomerResourcesTabController
    ]);

  function CustomerResourcesTabController(BaseCustomerResourcesTabController, ENV) {
    var controllerScope = this;
    var ResourceController = BaseCustomerResourcesTabController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.category = ENV.VirtualMachines;
        this._super();
        this.entityOptions.entityData.noMatchesText = 'No VMs found matching filter.';
        this.entityOptions.entityData.openMap = this.openMap.bind(this);
      }
    });
    controllerScope.__proto__ = new ResourceController();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('CustomerPrivateCloudTabController', [
      'BaseCustomerResourcesTabController', 'ENV',
      CustomerPrivateCloudTabController
    ]);

  function CustomerPrivateCloudTabController(BaseCustomerResourcesTabController, ENV) {
    var controllerScope = this;
    var ResourceController = BaseCustomerResourcesTabController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.category = ENV.PrivateClouds;
        this._super();
        this.entityOptions.entityData.noMatchesText = 'No private clouds found matching filter.';
        this.entityOptions.entityData.openMap = this.openMap.bind(this);
      }
    });
    controllerScope.__proto__ = new ResourceController();
  }
})();

(function() {

  angular.module('ncsaas')
    .controller('CustomerApplicationsTabController', [
      'BaseCustomerResourcesTabController', 'ENV',
      CustomerApplicationsTabController]);

  function CustomerApplicationsTabController(BaseCustomerResourcesTabController, ENV) {
    var controllerScope = this;
    var ResourceController = BaseCustomerResourcesTabController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this.category = ENV.Applications;
        this._super();

        this.entityOptions.entityData.noDataText = 'You have no applications yet';
        this.entityOptions.entityData.createLinkText = 'Add application';
        this.entityOptions.entityData.importLinkText = 'Import application';
        this.entityOptions.entityData.noMatchesText = 'No applications found matching filter.';
      }
    });
    controllerScope.__proto__ = new ResourceController();
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
        this.blockUIElement = 'tab-content';
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
      .controller('CustomerInvoicesTabController', [
        'baseControllerListClass',
        'invoicesService',
        'authService',
        'ENTITYLISTFIELDTYPES',
        CustomerInvoicesTabController
      ]);

  function CustomerInvoicesTabController(
    baseControllerListClass,
    invoicesService,
    authService,
    ENTITYLISTFIELDTYPES) {
    var controllerScope = this;
    var InvoicesController = baseControllerListClass.extend({
      init: function() {
        this.service = invoicesService;
        this._super();

        this.entityOptions = {
          entityData: {
            noDataText: 'No invoices yet',
            hideActionButtons: true,
            hideTableHead: false,
            rowTemplateUrl: 'views/payment/invoice.html'
          },
          list: [
            {
              name: 'Invoice code',
              propertyName: 'uuid',
              type: ENTITYLISTFIELDTYPES.trimmed,
              limit: 6
            },
            {
              name: 'Amount',
              propertyName: 'total_amount',
              type: ENTITYLISTFIELDTYPES.currency,
            },
            {
              name: 'Start date',
              propertyName: 'start_date',
              type: ENTITYLISTFIELDTYPES.dateShort,
            },
            {
              name: 'End date',
              propertyName: 'end_date',
              type: ENTITYLISTFIELDTYPES.dateShort,
            },
            {
              name: '',
              propertyName: 'downloadLink',
              iconClass: 'fa-file-pdf-o',
              type: ENTITYLISTFIELDTYPES.staticIconLink,
              className: 'pdf-icon'
            }
          ]
        };
      },
      afterGetList: function() {
        this._super();
        angular.forEach(this.list, function(invoice) {
          invoice.downloadLink = authService.getDownloadLink(invoice.pdf);
        });
      }
    });

    controllerScope.__proto__ = new InvoicesController();
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
        CustomerPaymentsTabController
      ]);

  function CustomerPaymentsTabController(
    baseControllerListClass,
    paymentsService,
    ENTITYLISTFIELDTYPES) {
    var controllerScope = this;
    var PaymentsController = baseControllerListClass.extend({
      defaultErrorMessage: "Reason unknown, please contact support",
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
                  return 'icon refresh spin';
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
      .controller('CustomerTeamTabController', [
        'baseControllerListClass',
        'customerPermissionsService',
        'customersService',
        'projectPermissionsService',
        'usersService',
        'currentStateService',
        '$q',
        '$rootScope',
        'ENTITYLISTFIELDTYPES',
        CustomerTeamTabController
      ]);

  function CustomerTeamTabController(
      baseControllerListClass,
      customerPermissionsService,
      customersService,
      projectPermissionsService,
      usersService,
      currentStateService,
      $q,
      $rootScope,
      ENTITYLISTFIELDTYPES) {
    var controllerScope = this;
    var TeamController = baseControllerListClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = customersService;
        this.searchFieldName = 'full_name';
        this.hideNoDataText = true;
        var vm = this;
        var fn = this._super.bind(this);
        var currentUserPromise = usersService.getCurrentUser();
        var currentCustomerPromise = currentStateService.getCustomer();
        $q.all([currentUserPromise, currentCustomerPromise]).then(function(result) {
          vm.currentUser = result[0];
          vm.currentCustomer = result[1];
          fn();
          vm.currentCustomer.owners.forEach(function(item) {
            if (vm.currentUser.uuid === item.uuid || vm.currentUser.is_staff) {
              vm.entityOptions.entityData.createPopup = vm.openPopup.bind(vm);
              vm.actionButtonsListItems = [
                {
                  title: 'Edit',
                  clickFunction: vm.openPopup.bind(vm)
                },
                {
                  title: 'Remove',
                  clickFunction: vm.remove.bind(vm)
                }
              ];
            }
          });
        });
        this.expandableOptions = [
          {
            isList: true,
            listKey: 'projects',
            addItemBlock: true,
            viewType: 'projects',
            title: 'Projects with admin privileges'
          }
        ];
        this.entityOptions = {
          entityData: {
            createPopupText: 'Add member',
            showPopup: false,
            noDataText: 'No users yet',
            hideActionButtons: false,
            hideTableHead: false,
            hidePagination: true
          },
          list: [
            {
              className: 'avatar',
              avatarSrc: 'email',
              showForMobile: false,
              notSortable: true,
              type: ENTITYLISTFIELDTYPES.avatarPictureField
            },
            {
              name: 'Member',
              showForMobile: true,
              propertyName: 'full_name',
              propertyNameBackup: 'username',
              type: ENTITYLISTFIELDTYPES.linkOrText,
              className: 'reduce-cell-width'
            },
            {
              name: 'Owner',
              showForMobile: true,
              propertyName: 'role',
              type: ENTITYLISTFIELDTYPES.bool,
              className: 'shared-filed reduce-cell-width'
            }
          ]
        };
        $rootScope.$on('reloadList', function() {
          vm.service.clearAllCacheForCurrentEndpoint();
          vm.getList();
        })
      },
      afterGetList: function() {
        var vm = this;
        usersService.getList().then(function(result) {
          vm.list.forEach(function(item, i) {
            result.forEach(function(item2) {
              if (item.uuid == item2.uuid) {
                vm.list[i].email = item2.email;
                vm.list[i].username = item2.username;
              }
            });
          });
        });
      },
      getList: function(filter) {
        var vm = this;
        filter = filter || {};
        filter = angular.extend({operation: 'users', UUID: vm.currentCustomer.uuid}, filter);
        return this._super(filter);
      },
      removeInstance: function(user) {
        var vm = this;
        var deferred = $q.defer();
        var promises = [];
        user.projects.forEach(function(project) {
          var promise = projectPermissionsService.$delete(vm.getPermissionKey(project.permission));
          promises.push(promise);
        });
        $q.all(promises).then(function() {
          if (user.permission) {
            customerPermissionsService.$delete(vm.getPermissionKey(user.permission)).then(
                function() {
                  deferred.resolve();
                },
                function(response) {
                  deferred.reject(response.data.detail);
                }
            );
          } else {
            deferred.resolve();
          }
        });
        this.entityOptions.entityData.showPopup = false;
        return deferred.promise;
      },
      getPermissionKey: function(url) {
        var arr = url.split('/');
        return arr[arr.length-2];
      },
      openPopup: function(user) {
        this.entityOptions.entityData.showPopup = true;
        $rootScope.$broadcast('populatePopupModel', user);
      }
    });

    controllerScope.__proto__ = new TeamController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('CustomerDeleteTabController', [
      'baseControllerClass',
      'customersService',
      'currentStateService',
      '$state',
      CustomerDeleteTabController
    ]);

  function CustomerDeleteTabController(
    baseControllerClass,
    customersService,
    currentStateService,
    $state
  ) {
    var controllerScope = this;
    var DeleteController = baseControllerClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this._super();
        var vm = this;
        currentStateService.getCustomer().then(function(customer) {
          vm.customer = customer;
        });
      },
      removeCustomer: function() {
        var confirmDelete = confirm('Confirm deletion?'),
          vm = this;
        if (confirmDelete) {
          currentStateService.setCustomer(null);
          this.customer.$delete().then(function(instance) {
            customersService.clearAllCacheForCurrentEndpoint();
            customersService.getPersonalOrFirstCustomer(instance.name).then(function(customer) {
              currentStateService.setCustomer(customer);
              $state.go('organizations.details', {uuid: customer.uuid, tab: 'eventlog'});
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
        this.views = [
          {
            type: 'WebServer',
            name: 'Apache',
            count: 0
          },
          {
            type: 'Database',
            name: 'MySQL',
            count: 0
          }
        ];

        this.infrastructures = [
          {
            type: 'WebServer',
            views: [
              'server1',
              'server2'
            ]
          },
          {
            type: 'Database',
            views: [
              'MySQL',
              'MSSQL'
            ]
          },
          {
            type: 'WebServer2',
            views: [
              'server1',
              'server2'
            ]
          },
          {
            type: 'WebServer3',
            views: [
              'server1',
              'server2'
            ]
          }
        ];
      },
      addView: function(type, name) {
        for (var i = 0; this.views.length > i; i++) {
          if (this.views[i].type === type && this.views[i].name === name) {
            this.views[i].count++;
            return;
          }
        }
        this.views.push({
          type: type,
          name: name,
          count: 0
        });
      }
    });

    controllerScope.__proto__ = new SizingController();
  }

})();
