import './resource-global-list.scss';

// @ngInject
function ResourceGlobalListController($rootScope, $scope, baseResourceListController) {
  let controllerScope = this;
  let ResourceController = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this.connectWatchers();
      this._super();
    },
    getTableOptions: function() {
      let options = this._super();
      options.columns = [
        {
          id: 'name',
          title: gettext('Name'),
          className: 'all resource_name_field',
          orderField: 'name',
          render: row => this.renderResourceName(row),
        },
        {
          id: 'customer',
          title: gettext('Organization'),
          className: 'min-tablet-l resource_customer_field',
          orderField: 'customer_name',
          render: row => row.customer_name,
        },
        {
          id: 'project',
          title: gettext('Project'),
          className: 'min-tablet-l resource_project_field',
          orderField: 'project_name',
          render: row => row.project_name,
        },
        {
          id: 'state',
          title: gettext('State'),
          className: 'min-tablet-l',
          orderField: 'state',
          render: row => this.renderResourceState(row),
        },
      ];
      return options;
    },
    connectWatchers: function() {
      $scope.$watch(() => controllerScope.filter, () => {
        $rootScope.$broadcast('gotoFirstPage');
        controllerScope.getList();
      }, true);
    },
    getFilter: function() {
      return controllerScope.filter;
    }
  });
  controllerScope.__proto__ = new ResourceController();
}

const resourceGlobalList = {
  controller: ResourceGlobalListController,
  controllerAs: 'ListController',
  templateUrl: 'views/partials/filtered-list.html',
  bindings: {
    filter: '<',
  }
};

export default resourceGlobalList;
