// @ngInject
export default function ProviderListController(
  $stateParams,
  $location,
  $rootScope,
  joinService,
  $uibModal,
  $state,
  $scope,
  ENV,
  ncUtils,
  baseControllerListClass,
  ENTITYLISTFIELDTYPES,
  currentStateService,
  customersService,
  currentUser,
  ncServiceUtils
  ) {
  var controllerScope = this;
  var Controller = baseControllerListClass.extend({
    defaultErrorMessage: ENV.defaultErrorMessage,
    init: function() {
      this.controllerScope = controllerScope;
      this.service = joinService;
      this.service.defaultFilter.customer = $stateParams.uuid;
      this._super();
      this.showSelectedProvider();
      $scope.$on('refreshProviderList', function() {
        controllerScope.resetCache();
      });
      currentStateService.getCustomer().then(customer => {
        this.currentCustomer = customer;
        this.checkPermissions();
        this.tableOptions = {
          searchFieldName: 'name',
          noDataText: 'No providers yet.',
          noMatchesText: 'No providers found matching filter.',
          columns: [
            {
              title: 'Type',
              className: 'all',
              render: function(data, type, row, meta) {
                return row.service_type;
              }
            },
            {
              title: 'Name',
              className: 'all',
              render: function(data, type, row, meta) {
                return row.name;
              }
            },
            {
              title: 'State',
              className: 'text-center min-tablet-l',
              render: function(data, type, row, meta) {
                var cls = ncServiceUtils.getStateClass(row.state);
                return '<a class="{cls}" title="{title}"></a>'
                  .replace('{cls}', cls).replace('{title}', row.state);
              },
              width: '40px'
            },
            {
              title: 'System provider',
              className: 'text-center min-tablet-l',
              render: function(data, type, row, meta) {
                var cls = row.shared && 'fa-check' || 'fa-minus';
                return '<a class="bool-field"><i class="fa {cls}"/></a>'.replace('{cls}', cls);
              },
              width: '100px'
            },
            {
              title: 'Resources',
              className: 'text-center min-tablet-l',
              render: function(data, type, row, meta) {
                if (!controllerScope.canUserManageService) {
                  return 'N/A';
                }
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
      })
    },
    openDialog: function(row) {
      $uibModal.open({
        component: 'providerDetails',
        size: 'lg',
        resolve: {
          provider: function() {
            return row;
          }
        }
      });
    },
    getTableActions: function() {
      let vm = this;
      var quotaReached = ncUtils.isCustomerQuotaReached(vm.currentCustomer, 'service');
      let title;
      if (!this.canUserManageService) {
        title = 'Only customer owner or staff can create provider.';
      }
      if (quotaReached) {
        title = 'Quota has been reached.';
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
      this.canUserManageService = customersService.checkCustomerUser(this.currentCustomer, currentUser);
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
