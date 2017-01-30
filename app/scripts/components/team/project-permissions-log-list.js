import template from './permissions-log-list.html';

const projectPermissionsLogList = {
  template: template,
  controller: projectPermissionsLogListController,
};

// @ngInject
function projectPermissionsLogListController(
  baseControllerListClass, projectPermissionsLogService, currentStateService) {
  var controllerScope = this;
  var controllerClass = baseControllerListClass.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.service = projectPermissionsLogService;
      this.currentProjectUuid = currentStateService.getProjectUuid();
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
