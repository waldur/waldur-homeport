const projectPermissionsLogList = {
  templateUrl: 'views/partials/filtered-list.html',
  controller: ProjectPermissionsLogListController,
  controllerAs: 'ListController'
};

// @ngInject
function ProjectPermissionsLogListController(
  baseEventListController, currentStateService) {
  let controllerScope = this;
  let EventController = baseEventListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      const fn = this._super.bind(this);
      currentStateService.getProject().then(project => {
        this.project = project;
        fn();
      });
    },
    getFilter: function() {
      return {
        scope: this.project.url,
        event_type: [
          'role_granted',
          'role_revoked',
          'role_updated',
        ]
      };
    }
  });

  controllerScope.__proto__ = new EventController();
}

export default projectPermissionsLogList;
