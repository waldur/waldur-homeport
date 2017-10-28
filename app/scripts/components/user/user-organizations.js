const userOrganizations = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: UserOrganizationsController,
  controllerAs: 'ListController',
};

export default userOrganizations;

// @ngInject
function UserOrganizationsController(
  baseControllerListClass,
  customerPermissionsService,
  usersService,
  TableExtensionService,
  $state,
  ncUtils,
  $uibModal,
  ENV) {
  let controllerScope = this;
  let ControllerListClass = baseControllerListClass.extend({
    init: function() {
      this.ownerCanManageCustomer = ENV.ownerCanManageCustomer;
      this.service = customerPermissionsService;
      this.controllerScope = controllerScope;
      let fn = this._super.bind(this);
      this.loading = true;
      this.loadContext().then(() => {
        this.tableOptions = this.getTableOptions();
        this.loading = false;
        fn();
      }).finally(() => {
        this.loading = false;
      });
    },
    loadContext: function() {
      return usersService.getCurrentUser().then(user => {
        this.currentUser = user;
      });
    },
    getFilter: function() {
      return {
        user_url: this.currentUser.url
      };
    },
    getTableOptions: function() {
      const extraColumns = TableExtensionService.getColumns('user-organizations');
      return {
        disableSearch: true,
        noDataText: gettext('No organizations yet'),
        noMatchesText: gettext('No organizations found matching filter.'),

        columns: [
          {
            title: gettext('Organization name'),
            className: 'all',
            render: function(row) {
              const href = $state.href('organization.dashboard', {uuid: row.customer_uuid});
              return ncUtils.renderLink(href, row.customer_name);
            },
          },
          {
            title: gettext('Owner'),
            className: 'text-center min-tablet-l',
            render: row => ncUtils.booleanField(row.role === 'owner'),
            width: '50px'
          },
        ].concat(extraColumns),
        tableActions: this.getTableActions(),
      };
    },
    getTableActions() {
      let actions = [];

      if (this.currentUser.is_staff || this.ownerCanManageCustomer) {
        actions.push({
          title: gettext('Add organization'),
          iconClass: 'fa fa-plus',
          callback: () => $uibModal.open({
            component: 'customerCreateDialog',
            size: 'lg',
          }),
        });
      }

      return actions;
    }
  });

  controllerScope.__proto__ = new ControllerListClass();
}
