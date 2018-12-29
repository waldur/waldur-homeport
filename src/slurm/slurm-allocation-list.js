const slurmAllocationList = {
  templateUrl: 'views/partials/filtered-list.html',
  controllerAs: 'ListController',
  controller: SlurmAllocationListController,
};

// @ngInject
function SlurmAllocationListController(
  baseResourceListController,
  $filter,
  coreUtils,
  SlurmAllocationService
  ) {
  let controllerScope = this;
  let controllerClass = baseResourceListController.extend({
    init: function() {
      this.controllerScope = controllerScope;
      this._super();
      this.service = SlurmAllocationService;
      this.addRowFields([
        'cpu_limit', 'cpu_usage',
        'gpu_limit', 'gpu_usage',
        'ram_limit', 'ram_usage',
        'service_settings',
      ]);
    },
    getTableOptions: function() {
      let options = this._super();
      options.disableSearch = true;
      options.noDataText = gettext('No allocations yet.');
      options.noMatchesText = gettext('No allocations found matching filter.');
      options.columns = [
        {
          title: gettext('Name'),
          className: 'all',
          orderField: 'name',
          render: row => this.renderResourceName(row)
        },
        {
          title: gettext('Provider'),
          render: row => row.service_name,
        },
        {
          title: gettext('Description'),
          render: row => row.description || 'N/A'
        },
        {
          title: gettext('Created'),
          render: row => $filter('shortDate')(row.created),
        },
        {
          title: gettext('CPU'),
          render: row => this.formatQuota('minutesToHours', row.cpu_limit, row.cpu_usage),
        },
        {
          title: gettext('GPU'),
          render: row => this.formatQuota('minutesToHours', row.gpu_limit, row.gpu_usage),
        },
        {
          title: gettext('RAM'),
          render: row => this.formatQuota('filesize', row.ram_limit, row.ram_usage),
        },
        {
          title: gettext('State'),
          className: 'min-tablet-l',
          render: row => this.renderResourceState(row)
        },
      ];
      return options;
    },
    formatQuota: function(filter, limit, usage) {
      const context = {
        limit: $filter(filter)(limit),
        usage: $filter(filter)(usage),
      };
      const template = usage >= 0 ? gettext('{usage} of {limit}') : '0';
      const tooltip = coreUtils.templateFormatter(template, context);
      const percent = Math.min(1, limit > 0 ? usage / limit : 0);
      return `<span uib-tooltip="${tooltip}"><quota-pie value="${percent}"></quota-pie></span>`;
    },
    getTableActions: function() {
      return [this.getCreateAction()];
    },
    getCategoryKey: function() {
      return 'slurm';
    },
    getCategoryState: function() {
      return 'appstore.slurm';
    },
    getFilter: function() {
      return {
        project_uuid: this.currentProject.uuid
      };
    },
  });

  controllerScope.__proto__ = new controllerClass();
}

export default slurmAllocationList;
