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
  $uibModal,
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
        enableOrdering: true,
        searchFieldName: 'summary',
        columns: [
          {
            title: gettext('Key'),
            className: 'all',
            render: row => row.key
          },
          {
            title: gettext('Status'),
            render: row => `<issue-type-icon type="${row.type}"></issue-type-icon> ${row.status || 'N/A'}`,
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
            title: gettext('Assigned to'),
            orderField: 'assignee_name',
            render: row => row.assignee_name || 'N/A'
          },
          {
            title: gettext('Resolution SLA'),
            orderField: 'first_response_sla',
            render: row => {
              const value = row.first_response_sla ? $filter('dateTime')(row.first_response_sla) : 'N/A';
              const tooltip = gettext('Time to resolution');
              return `<span uib-tooltip="${tooltip}">${value}</span>`;
            },
          },
          {
            title: gettext('Created'),
            render: row => $filter('dateTime')(row.created),
          },
        ],
        tableActions: this.getTableActions(),
      };
    },
    getFilter: function() {
      return {
        project_uuid: controllerScope.resource.uuid
      };
    },
    getTableActions: function() {
      return [
        {
          title: gettext('Create request'),
          iconClass: 'fa fa-plus',
          callback: () => {
            $uibModal.open({
              component: 'jiraIssueCreateDialog',
              resolve: {
                project: () => controllerScope.resource,
              }
            });
          },
        }
      ];
    }
  });
  controllerScope.__proto__ = new ResourceController();
}
