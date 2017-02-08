const projectPermissionsLogList = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: projectPermissionsLogListController,
  controllerAs: 'ListController'
};

// @ngInject
function projectPermissionsLogListController(
  baseControllerListClass, projectPermissionsLogService, currentStateService, $filter) {
  var controllerScope = this;
  var controllerClass = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = projectPermissionsLogService;
      this.currentProjectUuid = currentStateService.getProjectUuid();
      this.tableOptions = {
        searchFieldName: 'username',
        noDataText: 'You have no permissions yet.',
        noMatchesText: 'No permissions found matching filter.',
        columns: [
          {
            title: 'User',
            className: 'all',
            render: row => row.user_full_name || row.user_username
          },
          {
            title: 'User email',
            className: 'desktop',
            render: row => row.user_email
          },
          {
            title: 'Role',
            className: 'min-tablet-l',
            render: row => $filter('translate')(row.role)
          },
          {
            title: 'Created',
            className: 'min-tablet-l',
            render: row => $filter('dateTime')(row.created)
          },
          {
            title: 'Expiration time',
            className: 'min-tablet-l',
            render: row => $filter('dateTime')(row.expiration_time)
          }
        ],
      };
      this._super();
    },
    getFilter: function() {
      return {
        project_uuid: this.currentProjectUuid
      };
    },
  });

  controllerScope.__proto__ = new controllerClass();
}

export default projectPermissionsLogList;
