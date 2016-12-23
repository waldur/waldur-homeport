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
        noDataText: 'No projects yet',
        noMatchesText: 'No projects found matching filter.',

        columns: [
          {
            title: 'Project name',
            className: 'all',
            render: function(row) {
              return row.project_name;
            }
          },
          {
            title: 'Role',
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
