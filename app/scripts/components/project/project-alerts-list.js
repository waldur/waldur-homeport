const projectAlertsList = {
  controller: ProjectAlertTabController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
};

export default projectAlertsList;

// @ngInject
function ProjectAlertTabController(
  BaseAlertsListController,
  currentStateService
) {
  let controllerScope = this;
  let AlertController = BaseAlertsListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
    },
    getList: function(filter) {
      let getList = this._super.bind(controllerScope),
        vm = this;
      this.service.defaultFilter.aggregate = 'project';
      this.service.defaultFilter.opened = true;
      return currentStateService.getProject().then(function(response) {
        vm.service.defaultFilter.uuid = response.uuid;
        return getList(filter);
      });
    }
  });

  controllerScope.__proto__ = new AlertController();
}
