import template from './customer-list.html';
import {getTotal} from './customer-total-cost-service';

const customerList = {
  template,
  controller: CustomerListController,
  controllerAs: 'ListController',
};

export default customerList;

// @ngInject
function CustomerListController(
  baseControllerListClass,
  customersService,
  QuotaUtilsService,
  TableExtensionService,
  $state,
  $filter,
  ncUtils) {
  let controllerScope = this;
  let ControllerListClass = baseControllerListClass.extend({
    init: function() {
      this.service = customersService;
      this.controllerScope = controllerScope;
      this.tableOptions = this.getTableOptions();
      this._super();
    },
    getTableOptions: function() {
      return {
        noDataText: gettext('No organizations yet'),
        noMatchesText: gettext('No organizations found matching filter.'),
        searchFieldName: 'name',
        columns: this.getColumns(),
      };
    },
    getColumns: function() {
      const baseColumns = [
        {
          title: gettext('Organization name'),
          className: 'all',
          render: function(row) {
            const href = $state.href('organization.dashboard', {uuid: row.uuid});
            return ncUtils.renderLink(href, row.name);
          },
          index: 10,
        },
        {
          title: gettext('Abbreviation'),
          render: row => row.abbreviation || 'N/A',
          index: 20,
        },
        {
          title: gettext('Created'),
          render: row => $filter('shortDate')(row.created),
          index: 30,
        },
        {
          title: gettext('Start day of accounting'),
          render: row => $filter('shortDate')(row.accounting_start_date) || 'N/A',
          index: 40,
        },
        {
          title: gettext('VMs'),
          render: row => row.vm_count,
          index: 100,
        },
        {
          title: gettext('Storage'),
          render: row => row.storage_count,
          index: 110,
        },
        {
          title: gettext('Apps'),
          feature: 'resource.applications',
          render: row => row.app_count,
          index: 120,
        },
        {
          title: gettext('Private clouds'),
          render: row => row.private_cloud_count,
          index: 130,
        },
        {
          title: gettext('Estimated cost'),
          render: row => $filter('defaultCurrency')(row.billing_price_estimate.total),
          index: 310,
        },
      ];
      const extraColumns = TableExtensionService.getColumns('customer-list');
      return baseColumns.concat(extraColumns).sort((a, b) => a.index - b.index);
    },
    afterGetList: function(filter) {
      let fn = this._super.bind(this);
      this.list.forEach(item => angular.extend(item, QuotaUtilsService.parseCounters(item)));
      return getTotal(filter).then(totalCost => {
        this.controllerScope.totalCost = totalCost;
        fn();
      });
    },
    getUserFilter: function() {
      return {
        name: 'accounting_is_running',
        choices: [
          {
            title: gettext('Accounting is running'),
            value: true,
          },
          {
            title: gettext('Accounting is not running'),
            value: false
          },
        ]
      };
    },
    getSelectFilter: function() {
      let date = moment().startOf('month');
      let choices = [];
      for(let i=0; i<12; i++) {
        const month = date.month() + 1;
        const year = date.year();
        const label = date.format('MMMM, YYYY');
        choices.push({
          label,
          value: { year, month}
        });
        date = date.subtract(1, 'month');
      }
      return {
        label: gettext('Accounting period'),
        choices
      };
    }
  });

  controllerScope.__proto__ = new ControllerListClass();
}
