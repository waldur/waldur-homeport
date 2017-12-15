const jiraIssuesList = {
  bindings: {
    resource: '<'
  },
  controller: JiraIssuesListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
};

export default jiraIssuesList;

// @ngInject
function JiraIssuesListController(
  $filter,
  baseControllerListClass,
  JiraIssuesService) {
  let controllerScope = this;
  let ResourceController = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = JiraIssuesService;
      this.tableOptions = this.getTableOptions();
      this._super();
    },
    getTableOptions: function() {
      return {
        noDataText: gettext('You have no issues yet.'),
        noMatchesText: gettext('No issues found matching filter.'),
        columns: [
          {
            title: gettext('Key'),
            className: 'all',
            render: row => row.key
          },
          {
            title: gettext('Status'),
            render: row => row.status
          },
          {
            title: gettext('Title'),
            render: row => this.renderLongText(row.summary)
          },
          {
            title: gettext('Description'),
            render: row => this.renderLongText(row.description)
          },
          {
            title: gettext('Created'),
            render: row => $filter('shortDate')(row.created),
          },
        ]
      };
    },
    getFilter: function() {
      return {
        project_uuid: controllerScope.resource.uuid
      };
    },
  });
  controllerScope.__proto__ = new ResourceController();
}
