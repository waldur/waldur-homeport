const providersList = {
  controller: ProviderListController,
  controllerAs: 'ListController',
  // eslint-disable-next-line quotes
  template: `<div class="wrapper wrapper-content" ng-include="'views/partials/filtered-list.html'"></div>`,
};

export default providersList;

// @ngInject
function ProviderListController(
  $stateParams,
  $location,
  joinService,
  $uibModal,
  $state,
  $sanitize,
  $scope,
  ENV,
  ncUtils,
  baseControllerListClass,
  currentStateService,
  customersService,
  usersService) {
  let controllerScope = this;
  let Controller = baseControllerListClass.extend({
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
      usersService.getCurrentUser().then(currentUser => {
        this.currentUser = currentUser;
        currentStateService.getCustomer().then(customer => {
          let vm = this;
          this.currentCustomer = customer;
          this.checkPermissions();
          this.tableOptions = {
            searchFieldName: 'name',
            noDataText: gettext('No providers yet.'),
            noMatchesText: gettext('No providers found matching filter.'),
            columns: [
              {
                title: gettext('Type'),
                className: 'all',
                render: function(row) {
                  return row.service_type;
                }
              },
              {
                title: gettext('Name'),
                className: 'all',
                render: function(row) {
                  return $sanitize(row.name);
                }
              },
              {
                title: gettext('State'),
                className: 'text-center min-tablet-l',
                render: function(row) {
                  return vm.renderProviderState(row);
                },
                width: '40px'
              },
              {
                title: gettext('System provider'),
                className: 'text-center min-tablet-l',
                render: function(row) {
                  let cls = row.shared && 'fa-check' || 'fa-minus';
                  return '<a class="bool-field"><i class="fa {cls}"></i></a>'.replace('{cls}', cls);
                },
                width: '100px'
              },
              {
                title: gettext('Resources'),
                className: 'text-center min-tablet-l',
                render: function(row) {
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
                title: gettext('Details'),
                iconClass: 'fa fa-search',
                callback: this.openDialog
              },
              {
                title: gettext('Remove'),
                iconClass: 'fa fa-trash',
                callback: this.remove.bind(this.controllerScope),

                isDisabled: function(service) {
                  return service.shared || !this.canUserManageService || service.resources_count > 0;
                }.bind(this.controllerScope),

                tooltip: function(service) {
                  if (service.shared) {
                    return gettext('You cannot remove shared provider.');
                  }
                  if (!this.canUserManageService) {
                    return ENV.plugins.WALDUR_CORE.ONLY_STAFF_MANAGES_SERVICES ?
                      gettext('Only staff can remove provider.') :
                      gettext('Only customer owner or staff can remove provider.');
                  }
                  if (service.resources_count > 0) {
                    return gettext('Provider has resources. Please remove them first.');
                  }
                }.bind(this.controllerScope),
              },

              {
                title: gettext('Unlink'),
                iconClass: 'fa fa-chain-broken',

                callback: function(service) {
                  let vm = this.controllerScope;
                  let confirmDelete = confirm(gettext('Are you sure you want to unlink provider and all related resources?'));
                  if (confirmDelete) {
                    vm.unlinkService(service).then(function() {
                      vm.afterInstanceRemove(service);
                    }, vm.handleActionException.bind(vm));
                  }
                }.bind(this.controllerScope),

                isDisabled: function() {
                  return !this.canUserManageService;
                }.bind(this.controllerScope),

                isVisible: function(service) {
                  return !service.shared;
                },

                tooltip: function(service) {
                  if (!this.canUserManageService) {
                    return ENV.plugins.WALDUR_CORE.ONLY_STAFF_MANAGES_SERVICES ?
                      gettext('Only staff can unlink provider.') :
                      gettext('Only customer owner or staff can unlink provider.');
                  }
                  if (service.shared) {
                    return gettext('Can\'t unlink system provider.');
                  }
                }.bind(this.controllerScope),
              }
            ],
            tableActions: this.getTableActions(),
            actionsColumnWidth: '250px'
          };
        });
      });
    },
    renderProviderState: function(row) {
      const index = this.findIndexById(row);
      return `<provider-state provider="controller.list[${index}]"></provider-state>`;
    },
    openDialog: function(row) {
      $uibModal.open({
        component: 'providerDialog',
        size: 'lg',
        resolve: {
          provider: () => row,
          editable: () => true,
        }
      });
    },
    getTableActions: function() {
      let vm = this;
      let quotaReached = ncUtils.isCustomerQuotaReached(vm.currentCustomer, 'service');
      let title;
      if (!this.canUserManageService) {
        title = ENV.plugins.WALDUR_CORE.ONLY_STAFF_MANAGES_SERVICES ?
          gettext('Only staff can create provider.') :
          gettext('Only customer owner or staff can create provider.');
      }
      if (quotaReached) {
        title = gettext('Quota has been reached.');
      }
      return [
        {
          title: gettext('Add provider'),
          iconClass: 'fa fa-plus',
          callback: function() {
            $state.go('organization.createProvider', {
              uuid: vm.currentCustomer.uuid
            });
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
    checkPermissions: function() {
      if (ENV.plugins.WALDUR_CORE.ONLY_STAFF_MANAGES_SERVICES && !this.currentUser.is_staff) {
        this.canUserManageService = false;
        return;
      }
      this.canUserManageService = customersService.checkCustomerUser(this.currentCustomer, this.currentUser);
    },
    afterInstanceRemove: function(instance) {
      this._super(instance);
      $location.search({tab: 'providers'});
    },
    showSelectedProvider: function() {
      let vm = this;
      let service_type = $stateParams.providerType;
      let uuid = $stateParams.providerUuid;

      if (service_type && uuid) {
        let row = vm.findItem(service_type, uuid);
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
      for (let i = 0; i < this.list.length; i++) {
        let item = this.list[i];
        if (item.uuid === uuid && item.service_type === service_type) {
          return item;
        }
      }
    }
  });
  controllerScope.__proto__ = new Controller();
}
