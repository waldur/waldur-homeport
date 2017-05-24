const userProjects = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: UserProjectsController,
  controllerAs: 'ListController',
};

export default userProjects;

// @ngInject
function UserProjectsController(
  baseControllerListClass, projectPermissionsService, usersService, $state, ncUtils) {
  var controllerScope = this;
  var ControllerListClass = baseControllerListClass.extend({
    init: function() {
      this.service = projectPermissionsService;
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
        noDataText: gettext('No projects yet'),
        noMatchesText: gettext('No projects found matching filter.'),

        columns: [
          {
            title: gettext('Project name'),
            className: 'all',
            render: function(row) {
              const href = $state.href('project', {uuid: row.project_uuid});
              return ncUtils.renderLink(href, row.project_name);
            }
          },
          {
            title: gettext('Organization'),
            className: 'all',
            render: function(row) {
              return row.customer_name;
            }
          },
          {
            title: gettext('Role'),
            className: 'all',
            render: function(row) {
              return row.role;
            }
          },
        ]
      };
    }
  });

  controllerScope.__proto__ = new ControllerListClass();
}
