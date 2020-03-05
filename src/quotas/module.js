import { formatQuotaName, formatQuotaValue } from './utils';
import quotasTable from './quotas-table';
import quotaUsageBarChart from './quota-usage-bar-chart';

export default module => {
  module.filter('quotaName', () => formatQuotaName);
  module.filter('quotaValue', () => formatQuotaValue);
  module.component('quotasTable', quotasTable);
  module.component('quotaUsageBarChart', quotaUsageBarChart);
};
