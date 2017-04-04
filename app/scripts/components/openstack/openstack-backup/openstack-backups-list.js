export default function openstackBackupsList() {
  return {
    restrict: 'E',
    templateUrl: 'views/partials/filtered-list.html',
    controller: OpenStackBackupsListController,
    controllerAs: 'ListController',
    scope: {},
    bindToController: {
      resource: '='
    }
  };
}

// @ngInject
function OpenStackBackupsListController(
  baseResourceListController, openstackBackupsService, actionUtilsService, $filter) {
  var controllerScope = this;
  var controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      var fn = this._super.bind(this);
      this.loading = true;
      actionUtilsService.loadNestedActions(this, controllerScope.resource, 'backups').then(result => {
        this.listActions = result;
        fn();
        this.service = openstackBackupsService;
        this.rowFields.push('kept_until');
        this.rowFields.push('instance_internal_ips_set');
        this.rowFields.push('instance_security_groups');
      });
    },
    getTableOptions: function() {
      var options = this._super();
      options.disableSearch = true;
      options.noDataText = gettext('No backups yet.');
      options.noMatchesText = gettext('No backups found matching filter.');
      options.tableActions = this.listActions;
      options.columns = [
        {
          title: gettext('Name'),
          className: 'all',
          render: row => this.renderResourceName(row)
        },
        {
          title: gettext('Description'),
          render: row => row.description || 'N/A'
        },
        {
          title: gettext('Keep until'),
          render: row => $filter('shortDate')(row.kept_until) || '&mdash;'
        },
        {
          title: gettext('State'),
          className: 'min-tablet-l',
          render: row => this.renderResourceState(row)
        },
      ];
      return options;
    },
    getFilter: function() {
      const fields = {
        'OpenStackTenant.Instance': 'instance',
        'OpenStackTenant.BackupSchedule': 'backup_schedule',
      };
      const {resource_type, url} = controllerScope.resource;
      let field = fields[resource_type];
      if (field) {
        return {
          [field]: url
        };
      }
    }
  });

  controllerScope.__proto__ = new controllerClass();
}
