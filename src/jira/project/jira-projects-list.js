const jiraProjectsList = {
  controller: JiraProjectsListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
};

export default jiraProjectsList;

// @ngInject
function JiraProjectsListController(
  $filter,
  baseResourceListController,
  JiraProjectService) {
  let controllerScope = this;
  let ResourceController = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = JiraProjectService;
      this.addRowFields([
        'template_name', 'template_description'
      ]);
    },
    getTableOptions: function() {
      let options = this._super();
      options.noDataText = gettext('You have no service desk projects yet.');
      options.noMatchesText = gettext('No service desk projects found matching filter.');
      options.columns = [
        {
          title: gettext('Name'),
          className: 'all',
          orderField: 'name',
          render: row => this.renderResourceName(row)
        },
        {
          title: gettext('Type'),
          render: row => this.formatType(row)
        },
        {
          title: gettext('Provider'),
          render: row => row.service_name
        },
        {
          title: gettext('Created'),
          render: row => $filter('shortDate')(row.created),
        },
      ];
      return options;
    },
    formatType: function(row) {
      if (!row.template_name) {
        return 'N/A';
      }
      return `<span uib-tooltip="${row.template_description}">${row.template_name}</span>`;
    },
    getTableActions: function() {
      return [this.getCreateAction()];
    },
    getCategoryKey: function() {
      return 'jiraProject';
    },
    getCategoryState: function() {
      return 'appstore.jira-project';
    },
    getFilter: function() {
      return {
        project_uuid: this.currentProject.uuid
      };
    },
  });
  controllerScope.__proto__ = new ResourceController();
}
