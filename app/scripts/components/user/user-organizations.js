const userOrganizations = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: UserOrganizationsController,
  controllerAs: 'ListController',
};

export default userOrganizations;

// @ngInject
function UserOrganizationsController(
  baseControllerListClass, customerPermissionsService, usersService, $state, ncUtils) {
  var controllerScope = this;
  var ControllerListClass = baseControllerListClass.extend({
    init: function() {
      this.service = customerPermissionsService;
      this.controllerScope = controllerScope;
      var fn = this._super.bind(this);
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
            render: function(row) {
              var cls = (row.role === 'owner') && 'fa-check' || 'fa-minus';
              return '<a class="bool-field"><i class="fa {cls}"/></a>'.replace('{cls}', cls);
            },
            width: '50px'
          }
        ]
      };
    }
  });

  controllerScope.__proto__ = new ControllerListClass();
}
