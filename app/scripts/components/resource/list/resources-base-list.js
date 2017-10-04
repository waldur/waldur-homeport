// @ngInject
export default function BaseProjectResourcesTabController(baseResourceListController, currentStateService) {
  var controllerClass = baseResourceListController.extend({
    getList: function(filter) {
      var vm = this;
      var fn = this._super.bind(vm);
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
