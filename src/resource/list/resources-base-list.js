// @ngInject
export default function BaseProjectResourcesTabController(baseResourceListController, currentStateService) {
  let controllerClass = baseResourceListController.extend({
    getList: function(filter) {
      let vm = this;
      let fn = this._super.bind(vm);
      return currentStateService.getProject().then(function(project){
        if (project) {
          vm.service.defaultFilter.project_uuid = project.uuid;
        }
        return fn(filter);
      });
    }
  });
  return controllerClass;
}
