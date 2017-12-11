const jiraProjectsList = {
  controller: JiraProjectsListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
};

export default jiraProjectsList;

// @ngInject
function JiraProjectsListController(
  baseResourceListController,
  JiraProjectService) {
  let controllerScope = this;
  let ResourceController = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = JiraProjectService;
    },
    getTableOptions: function() {
      let options = this._super();
      options.noDataText = gettext('You have no service desk projects yet.');
      options.noMatchesText = gettext('No service desk projects found matching filter.');
      return options;
    },
    getFilter: function() {
      return {
        project_uuid: this.currentProject.uuid
      };
    },
  });
  controllerScope.__proto__ = new ResourceController();
}
