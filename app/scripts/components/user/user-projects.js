export default function userProjects() {
  return {
    restrict: 'E',
    templateUrl: 'views/partials/filtered-list.html',
    controller: UserProjectsController,
    controllerAs: 'ListController',
    scope: {}
  };
}

// @ngInject
function UserProjectsController(
  baseControllerListClass, projectPermissionsService, usersService) {
  var controllerScope = this;
  var ControllerListClass = baseControllerListClass.extend({
    init: function() {
      this.service = projectPermissionsService;
      this.controllerScope = controllerScope;
      this.tableOptions = {
        disableSearch: true,
        noDataText: gettext('No projects yet'),
        noMatchesText: gettext('No projects found matching filter.'),

        columns: [
          {
            title: gettext('Project name'),
            className: 'all',
            render: function(row) {
              return row.project_name;
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
      this._super();
    },
    getFilter: function() {
      return {
        user_url: usersService.currentUser.url
      };
    }
  });

  controllerScope.__proto__ = new ControllerListClass();
}
