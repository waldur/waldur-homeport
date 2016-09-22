(function() {
  angular.module('ncsaas')
    .controller('ProviderListController', [
      '$stateParams',
      '$location',
      '$rootScope',
      'joinService',
      '$uibModal',
      'ENV',
      'baseControllerListClass',
      'ENTITYLISTFIELDTYPES',
      'currentStateService',
      'customersService',
      'ncServiceUtils',
      ProviderListController
    ]);

  function ProviderListController(
    $stateParams,
    $location,
    $rootScope,
    joinService,
    $uibModal,
    ENV,
    baseControllerListClass,
    ENTITYLISTFIELDTYPES,
    currentStateService,
    customersService,
    ncServiceUtils
    ) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      defaultErrorMessage: "Reason unknown, please contact support",
      init: function() {
        this.controllerScope = controllerScope;
        this.service = joinService;
        this.service.defaultFilter.customer = $stateParams.uuid;
        this.tableOptions = {
          searchFieldName: 'name',
          noDataText: 'No providers yet.',
          noMatchesText: 'No providers found matching filter.',
          columns: [
            {
              title: 'Type',
              render: function(data, type, row, meta) {
                return row.service_type;
              }
            },
            {
              title: 'Name',
              render: function(data, type, row, meta) {
                return row.name
              }
            },
            {
              title: 'State',
              render: function(data, type, row, meta) {
                var cls = ncServiceUtils.getStateClass(row.state);
                return '<a class="{cls}" title="{title}"></a>'
                          .replace('{cls}', cls).replace('{title}', row.state);
              },
              width: '40px'
            },
            {
              title: 'My provider',
              render: function(data, type, row, meta) {
                var cls = row.shared && 'fa-minus' || 'fa-check';
                return '<a class="bool-field"><i class="fa {cls}"/></a>'.replace('{cls}', cls);
              },
              width: '100px'
            },
            {
              title: 'Resources',
              render: function(data, type, row, meta) {
                return row.resources_count || 0;
              },
              width: '40px'
            }
          ],
          rowActions: [
            {
              name: 'Details',
              callback: function(row) {
                var dialogScope = $rootScope.$new();
                dialogScope.expandableElement = row;
                $uibModal.open({
                  templateUrl: 'views/provider-details-dialog.html',
                  scope: dialogScope,
                  size: 'lg'
                });
              }
            }
          ],
          actionsColumnWidth: '40px'
        };
        this._super();
        this.checkPermissions();
        this.checkProjects();
        this.actionButtonsListItems = [
          {
            title: 'Remove',
            icon: 'fa-trash',
            destructive: true,
            clickFunction: this.remove.bind(this.controllerScope),

            isDisabled: function(service) {
              return service.shared || !this.canUserManageService || service.resources_count > 0;
            }.bind(this.controllerScope),

            tooltip: function(service) {
              if (service.shared) {
                return 'You cannot remove shared provider';
              }
              if (!this.canUserManageService) {
                return 'Only customer owner or staff can remove provider';
              }
              if (service.resources_count > 0) {
               return 'Provider has resources. Please remove them first';
              }
            }.bind(this.controllerScope),
          },
          {
            title: 'Unlink',
            icon: 'fa-trash',
            destructive: true,

            clickFunction: function(service) {
              var vm = this.controllerScope;
              var confirmDelete = confirm('Are you sure you want to unlink provider and all related resources?');
              if (confirmDelete) {
                vm.unlinkService(service).then(function() {
                  vm.afterInstanceRemove(service);
                }, vm.handleActionException.bind(vm));
              }
            }.bind(this.controllerScope),

            isDisabled: function(service) {
              return !this.canUserManageService;
            }.bind(this.controllerScope),

            tooltip: function(service) {
              if (!this.canUserManageService) {
                return 'Only customer owner or staff can unlink provider.';
              }
            }.bind(this.controllerScope),
          }
        ];
        this.entityOptions = {
          entityData: {
            createLink: null,
            createLinkText: 'Add provider',
            checkQuotas: 'service',
            timer: ENV.providersTimerInterval,
            rowTemplateUrl: 'views/service/row.html'
          },
        };
      },
      checkProjects: function() {
        var vm = this;
        currentStateService.getCustomer().then(function(customer) {
          vm.currentCustomer = customer;
        });
      },
      removeInstance: function(model) {
        return this.service.$deleteByUrl(model.url);
      },
      unlinkService: function(service) {
        return this.service.operation('unlink', service.url);
      },
      afterInstanceRemove: function(instance) {
        $rootScope.$broadcast('refreshProjectList');
        this._super(instance);
      },
      checkPermissions: function() {
        var vm = this;
        customersService.isOwnerOrStaff().then(function(isOwnerOrStaff) {
          if (isOwnerOrStaff) {
            vm.entityOptions.entityData.createLink = 'services.create';
          }
          vm.canUserManageService = isOwnerOrStaff;
        });
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
    .controller('CustomerProjectTabController', ProjectListController);

  ProjectListController.$inject = [
    'baseControllerListClass',
    'projectsService',
    'customersService',
    'ENV',
    '$filter',
    '$state',
    'ncUtils',
    'currentCustomer',
    'currentUser'
  ];

  function ProjectListController(
    baseControllerListClass,
    projectsService,
    customersService,
    ENV,
    $filter,
    $state,
    ncUtils,
    currentCustomer,
    currentUser) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      init: function() {
        this.service = projectsService;
        this._super();
        this.tableOptions = {
          searchFieldName: 'name',
          noDataText: 'You have no projects yet.',
          noMatchesText: 'No projects found matching filter.',
          columns: this.getColumns(),
          tableActions: this.getTableActions()
        };
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
            title: 'Apps',
            render: function(data, type, row, meta) {
              return row.app_count || 0;
            }
          });
          columns.push({
            title: 'PCs',
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
        var ownerOrStaff = customersService.checkCustomerUser(currentCustomer, currentUser);
        var quotaReached = ncUtils.isCustomerQuotaReached(currentCustomer, 'project');
        return [
          {
            name: '<i class="fa fa-plus"></i> Add project',
            callback: function() {
              $state.go('project-create');
            },
            disabled: !ownerOrStaff || quotaReached
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
          }
        }
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
          link: 'project.details({uuid: entity.project_uuid})',
          type: ENTITYLISTFIELDTYPES.name
        });
        this.rowFields = angular.copy(this.rowFields);
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
        this.entityOptions.entityData.createLink = 'appstore.store({category: "apps"})';
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
      .controller('CustomerTeamTabController', [
        'baseControllerListClass',
        'customerPermissionsService',
        'customersService',
        'projectPermissionsService',
        'usersService',
        'currentStateService',
        '$q',
        '$rootScope',
        '$uibModal',
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
      $uibModal,
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
            title: 'Projects with admin privileges',
            emptyTitle: 'User does not manage any project'
          }
        ];
        this.entityOptions = {
          entityData: {
            createPopupText: 'Add member',
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
        var promises = user.projects.map(function(project) {
          return projectPermissionsService.deletePermission(project.permission);
        });
        $q.all(promises).then(function() {
          if (user.permission) {
            customerPermissionsService.deletePermission(user.permission).then(
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
        return deferred.promise;
      },
      openPopup: function(user) {
        var dialogScope = $rootScope.$new();
        dialogScope.editUser = user;
        dialogScope.addedUsers = this.list.map(function(users) {
          return users.uuid;
        });
        $uibModal.open({
          templateUrl: 'views/directives/add-team-member.html',
          controller: 'AddTeamMemberDialogController',
          scope: dialogScope,
        }).result.then(function() {
          this.service.clearAllCacheForCurrentEndpoint();
          customerPermissionsService.clearAllCacheForCurrentEndpoint();
          this.getList();
        }.bind(this));
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
        this.loadInitial();
      },
      loadInitial: function() {
        var vm = this;
        vm.loading = true;
        return currentStateService.getCustomer().then(function(customer) {
          vm.customer = customer;
          return vm.checkCanRemoveCustomer(customer).then(function(result) {
            vm.canRemoveCustomer = result;
          });
        }).finally(function() {
          vm.loading = false;
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
        var confirmDelete = confirm('Confirm deletion?'),
          vm = this;
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
