import { randomDate, randomInteger, randomChoice } from '../../core/fixtures';

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
          className: 'all',
          orderField: 'name',
          render: row => this.renderResourceName(row),
        },
        {
          id: 'customer',
          title: gettext('Organization'),
          className: 'min-tablet-l',
          orderField: 'customer_name',
          render: row => row.customer_name,
        },
        {
          id: 'project',
          title: gettext('Project'),
          className: 'min-tablet-l',
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
        {
          id: 'backup_state',
          title: gettext('Backup'),
          feature: 'backup',
          className: 'min-tablet-l',
          render: row => this.renderComponent('resource-state-backup', row),
        },
        {
          id: 'monitoring_state',
          title: gettext('Monitoring'),
          feature: 'monitoring_state',
          className: 'min-tablet-l',
          render: row => this.renderComponent('resource-state-monitoring', row),
        },
        {
          id: 'issues',
          title: gettext('Issues'),
          feature: 'connected_issues',
          className: 'min-tablet-l',
          render: row => `${row.issues_open} / ${row.issues_total}`,
        },
      ];
      return options;
    },
    afterGetList: function() {
      this._super();
      this.setupFakeData();
    },
    setupFakeData() {
      const BACKUP_STATES = ['Unsupported', 'Unset', 'Warning', 'OK'];
      const MONITORING_STATES = ['Unregistered', 'Erred', 'Warning', 'OK'];

      this.list.forEach(resource => {
        resource.monitoring_state = randomChoice(MONITORING_STATES);
        resource.backup_state = randomChoice(BACKUP_STATES);
        resource.issues_open = randomInteger(0, 10);
        resource.issues_total = resource.issues_open + randomInteger(0, 10);
        resource.last_backup = moment(randomDate()).fromNow();
      });
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
