(function() {
  angular.module('ncsaas')
    .controller('ProviderListController', [
      '$stateParams',
      '$location',
      '$rootScope',
      'joinService',
      '$uibModal',
      '$state',
      'ENV',
      'ncUtils',
      'baseControllerListClass',
      'ENTITYLISTFIELDTYPES',
      'currentStateService',
      'customersService',
      'currentCustomer',
      'currentUser',
      'ncServiceUtils',
      ProviderListController
    ]);

  function ProviderListController(
    $stateParams,
    $location,
    $rootScope,
    joinService,
    $uibModal,
    $state,
    ENV,
    ncUtils,
    baseControllerListClass,
    ENTITYLISTFIELDTYPES,
    currentStateService,
    customersService,
    currentCustomer,
    currentUser,
    ncServiceUtils
    ) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      defaultErrorMessage: "Reason unknown, please contact support",
      init: function() {
        this.controllerScope = controllerScope;
        this.service = joinService;
        this.service.defaultFilter.customer = $stateParams.uuid;
        this.checkPermissions();
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
              className: 'text-center',
              render: function(data, type, row, meta) {
                var cls = ncServiceUtils.getStateClass(row.state);
                return '<a class="{cls}" title="{title}"></a>'
                          .replace('{cls}', cls).replace('{title}', row.state);
              },
              width: '40px'
            },
            {
              title: 'My provider',
              className: 'text-center',
              render: function(data, type, row, meta) {
                var cls = row.shared && 'fa-minus' || 'fa-check';
                return '<a class="bool-field"><i class="fa {cls}"/></a>'.replace('{cls}', cls);
              },
              width: '100px'
            },
            {
              title: 'Resources',
              className: 'text-center',
              render: function(data, type, row, meta) {
                return row.resources_count || 0;
              },
              width: '40px'
            }
          ],
          rowActions: [
            {
              name: '<i class="fa fa-search"></i> Details',
              callback: this.openDialog
            },
            {
              name: '<i class="fa fa-trash"></i> Remove',
              callback: this.remove.bind(this.controllerScope),

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
              name: '<i class="fa fa-chain-broken"></i> Unlink',

              callback: function(service) {
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
          ],
          tableActions: this.getTableActions(),
          actionsColumnWidth: '250px'
        };
        this._super();
        this.showSelectedProvider();
      },
      openDialog: function(row) {
        var dialogScope = $rootScope.$new();
        dialogScope.expandableElement = row;
        $uibModal.open({
          templateUrl: 'views/directives/provider-details-dialog.html',
          scope: dialogScope,
          size: 'lg',
          controller: 'ProviderDetailsDialog'
        });
      },
      getTableActions: function() {
        var quotaReached = ncUtils.isCustomerQuotaReached(currentCustomer, 'service');
        var title;
        if (!this.canUserManageService) {
          title = 'Only customer owner or staff can create provider.'
        }
        if (quotaReached) {
          title = 'Quota has been reached.'
        }
        return [
          {
            name: '<i class="fa fa-plus"></i> Add provider',
            callback: function() {
              $state.go('services.create');
            },
            disabled: !this.canUserManageService || quotaReached,
            titleAttr: title
          }
        ];
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
        this.canUserManageService = customersService.checkCustomerUser(currentCustomer, currentUser);
      },
      afterInstanceRemove: function(instance) {
        this._super(instance);
        $location.search({'tab': 'providers'});
      },
      showSelectedProvider: function() {
        var vm = this;
        var service_type = $stateParams.providerType;
        var uuid = $stateParams.providerUuid;

        if (service_type && uuid) {
          var row = vm.findItem(service_type, uuid);
          if (row) {
            this.openDialog(row);
          } else {
            this.service.$get(service_type, uuid).then(function(provider) {
              this.openDialog(provider);
            }.bind(this));
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
    .controller('ProviderDetailsDialog', ['$scope', function ProviderDetailsDialog($scope) {
      $scope.$on('$stateChangeSuccess', function() {
        $scope.$close();
      });
    }]);
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
        var vm = this;
        var ownerOrStaff = customersService.checkCustomerUser(vm.currentCustomer, vm.currentUser);
        var quotaReached = ncUtils.isCustomerQuotaReached(vm.currentCustomer, 'project');
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
        'currentUser',
        'currentCustomer',
        '$q',
        '$rootScope',
        '$uibModal',
        '$state',
        'ENV',
        CustomerTeamTabController
      ]);

  function CustomerTeamTabController(
      baseControllerListClass,
      customerPermissionsService,
      customersService,
      projectPermissionsService,
      currentUser,
      currentCustomer,
      $q,
      $rootScope,
      $uibModal,
      $state,
      ENV) {
    var controllerScope = this;
    var TeamController = baseControllerListClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = customersService;
        this.hideNoDataText = true;
        this.isOwnerOrStaff = customersService.checkCustomerUser(currentCustomer, currentUser);
        this.tableOptions = this.getTableOptions();
        this._super();
      },
      getTableOptions: function() {
        var vm = this;
        return {
          noDataText: 'You have no team members yet',
          noMatchesText: 'No members found matching filter.',
          searchFieldName: 'full_name',
          columns: [
            {
              title: 'Member',
              render: function(data, type, row, meta) {
                var avatar = '<img gravatar-src="\'{gravatarSrc}\'" gravatar-size="100" alt="" class="avatar-img img-xs">'
                  .replace('{gravatarSrc}', row.email);
                return avatar + ' ' + (row.full_name || row.username);
              }
            },
            {
              title: 'E-mail',
              render: function(data, type, row, meta) {
                return row.email;
              }
            },
            {
              title: 'Owner',
              render: function(data, type, row, meta) {
                var cls = row.role == 'owner' ? 'check' : 'minus';
                var title = ENV.roles[row.role];
                return '<span class="icon {cls}" title="{title}"></span>'
                  .replace('{cls}', cls)
                  .replace('{title}', title);
              }
            },
            {
              title: ENV.roles.manager + ' in:',
              render: function(data, type, row, meta) {
                return vm.formatProjectRolesList('manager', row);
              }
            },
            {
              title: ENV.roles.admin + ' in:',
              render: function(data, type, row, meta) {
                return vm.formatProjectRolesList('admin', row);
              }
            }
          ],
          tableActions: this.getTableActions(),
          rowActions: this.getRowActions()
        };
      },
      formatProjectRolesList: function (roleName, row) {
        var filteredProjects = row.projects.filter(function(item) {
          return item.role === roleName;
        });
        if (filteredProjects.length === 0) {
          return 'No projects are assigned to this role';
        }
        return filteredProjects.map(function(item) {
          var projectName = item.name;
          var href = $state.href('project.details', { uuid: item.uuid });
          return '<a href="{href}">{projectName}</a>'
            .replace('{projectName}', projectName)
            .replace('{href}', href)
        }).join(', ');
      },
      getTableActions: function() {
        if (this.isOwnerOrStaff) {
          return [
            {
              name: '<i class="fa fa-plus"></i> Add member',
              callback: this.openPopup.bind(this)
            }
          ];
        }
      },
      getRowActions: function() {
        if (this.isOwnerOrStaff) {
          return [
            {
              name: '<i class="fa fa-pencil"></i> Edit',
              callback: this.openPopup.bind(this)
            },
            {
              name: '<i class="fa fa-trash"></i> Remove',
              callback: this.remove.bind(this)
            }
          ];
        }
      },
      getList: function(filter) {
        return this._super(angular.extend({
          operation: 'users',
          UUID: currentCustomer.uuid
        }, filter));
      },
      removeInstance: function(user) {
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
        dialogScope.currentCustomer = currentCustomer;
        dialogScope.currentUser = currentUser;
        dialogScope.editUser = user;
        dialogScope.addedUsers = this.list.map(function(users) {
          return users.uuid;
        });
        $uibModal.open({
          component: 'addTeamMember',
          scope: dialogScope
        }).result.then(function() {
          controllerScope.resetCache();
          customerPermissionsService.clearAllCacheForCurrentEndpoint();
        });
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


(function() {
  angular.module('ncsaas')
    .controller('CustomerInvitationsTabController', CustomerInvitationsTabController);

  CustomerInvitationsTabController.$inject = [
    'baseControllerListClass',
    'customersService',
    'currentCustomer',
    'currentUser',
    'invitationService',
    'ncUtils',
    '$state',
    '$filter',
    '$rootScope',
    '$uibModal',
    'ncUtilsFlash',
    'ENV'
  ];
  function CustomerInvitationsTabController(
    baseControllerListClass,
    customersService,
    currentCustomer,
    currentUser,
    invitationService,
    ncUtils,
    $state,
    $filter,
    $rootScope,
    $uibModal,
    ncUtilsFlash,
    ENV
  ) {
    var controllerScope = this;
    var InvitationController = baseControllerListClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = invitationService;
        this.isOwnerOrStaff = customersService.checkCustomerUser(currentCustomer, currentUser);
        this.tableOptions = this.getTableOptions();
        this.getSearchFilters();
        this._super();
      },
      getSearchFilters: function() {
        this.searchFilters = [
          {
            name: 'state',
            title: 'Pending',
            value: 'pending'
          },
          {
            name: 'state',
            title: 'Cancelled',
            value: 'cancelled'
          },
          {
            name: 'state',
            title: 'Expired',
            value: 'expired'
          },
          {
            name: 'state',
            title: 'Accepted',
            value: 'accepted'
          }
        ];
      },
      getTableOptions: function() {
        return {
          noDataText: 'You have no team invitations yet',
          noMatchesText: 'No invitations found matching filter.',
          columns: [
            {
              title: 'E-mail',
              render: function(data, type, row, meta) {
                var avatar = '<img gravatar-src="\'{gravatarSrc}\'" gravatar-size="100" alt="" class="avatar-img img-xs">'
                  .replace('{gravatarSrc}', row.email);
                return avatar + ' ' + row.email;
              }
            },
            {
              title: 'Role',
              render: function(data, type, row, meta) {
                if (row.customer) {
                  return ENV.roles.owner;
                } else if (row.project) {
                  var href = $state.href('project.details', {
                    uuid: ncUtils.getUUID(row.project)
                  });
                  var roleTitle = ENV.roles[row.project_role] || 'Unknown';
                  var title = roleTitle + ' in ' + row.project_name;
                  return ncUtils.renderLink(href, title);
                }
              }
            },
            {
              title: 'Status',
              render: function(data, type, row, meta) {
                return row.state;
              }
            },
            {
              title: 'Created at',
              render: function(data, type, row, meta) {
                return $filter('dateTime')(row.created);
              }
            },
            {
              title: 'Expires at',
              render: function(data, type, row, meta) {
                return $filter('dateTime')(row.expires);
              }
            },
          ],
          tableActions: this.getTableActions(),
          rowActions: this.getRowActions()
        }
      },
      getTableActions: function() {
        return [
          {
            name: '<i class="fa fa-plus"></i> Invite user',
            callback: this.openDialog.bind(this),
            disabled: !this.isOwnerOrStaff,
            titleAttr: !this.isOwnerOrStaff && 'Only customer owner or staff can invite users.'
          }
        ];
      },
      openDialog: function() {
        var dialogScope = $rootScope.$new();
        dialogScope.customer = currentCustomer;
        $uibModal.open({
          templateUrl: 'views/customer/invitation-dialog.html',
          scope: dialogScope,
          controller: 'InvitationDialogController',
          controllerAs: 'DialogCtrl',
          bindToController: true,
        }).result.then(function() {
          controllerScope.resetCache();
        });
      },
      getRowActions: function() {
        if (this.isOwnerOrStaff) {
          return [
            {
              name: '<i class="fa fa-ban"></i> Cancel',
              callback: this.cancelInvitation.bind(this),
              isDisabled: function(row) {
                return row.state !== 'pending';
              },
              tooltip: function(row) {
                if (row.state !== 'pending') {
                  return 'Only pending invitation can be cancelled.';
                }
              }
            },
            {
              name: '<i class="fa fa-envelope-o"></i> Resend',
              callback: this.resendInvitation.bind(this),
              isDisabled: function(row) {
                return row.state !== 'pending';
              },
              tooltip: function(row) {
                if (row.state !== 'pending') {
                  return 'Only pending invitation can be sent again.';
                }
              }
            }
          ];
        }
      },
      cancelInvitation: function(row) {
        invitationService.cancel(row.uuid).then(function() {
          ncUtilsFlash.success('Invitation has been cancelled.');
          row.state = 'cancelled';
        }).catch(function() {
          ncUtilsFlash.error('Unable to cancel invitation.');
        });
      },
      resendInvitation: function(row) {
        invitationService.resend(row.uuid).then(function() {
          ncUtilsFlash.success('Invitation has been sent again.');
        }).catch(function() {
          ncUtilsFlash.error('Unable to resend invitation.');
        });
      }
    });
    controllerScope.__proto__ = new InvitationController();
  }
})();


(function() {
  angular.module('ncsaas')
    .controller('InvitationDialogController', InvitationDialogController);

  InvitationDialogController.$inject = ['$q', '$state', 'invitationService', 'ncUtilsFlash', 'ENV'];
  function InvitationDialogController($q, $state, invitationService, ncUtilsFlash, ENV) {
    var vm = this;
    vm.submitForm = submitForm;
    activate();

    function activate() {
      vm.roles = [
        {
          field: 'customer_role',
          title: ENV.roles.owner,
          value: 'owner',
          icon: 'fa-sitemap'
        },
        {
          field: 'project_role',
          title: ENV.roles.manager,
          value: 'manager',
          icon: 'fa-users'
        },
        {
          field: 'project_role',
          title: ENV.roles.admin,
          value: 'admin',
          icon: 'fa-server'
        }
      ];
      vm.role = vm.roles[0];
    }

    function submitForm() {
      if (vm.DialogForm.$invalid) {
        return $q.reject();
      }

      vm.submitting = true;
      return createInvite().then(function() {
        vm.$close();
        ncUtilsFlash.success('Invitation has been created.');
      }).catch(function(errors) {
        vm.errors = errors;
        ncUtilsFlash.error('Unable to create invitation.');
      }).finally(function() {
        vm.submitting = false;
      });
    }

    function createInvite() {
      var invite = invitationService.$create();
      invite.link_template = getTemplateUrl();
      invite.email = vm.email;
      if (vm.role.field === 'customer_role') {
        invite.customer_role = vm.role.value;
        invite.customer = vm.customer.url;
      } else if (vm.role.field === 'project_role') {
        invite.project_role = vm.role.value;
        invite.project = vm.project.url;
      }
      return invite.$save();
    }

    function getTemplateUrl() {
      var path = $state.href('invitation', {uuid: 'TEMPLATE'});
      return location.origin + path.replace('TEMPLATE', '{uuid}');
    }
  }
})();
