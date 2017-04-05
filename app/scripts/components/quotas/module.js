import { quotaName, quotaValue } from './filters';
import quotasTable from './quotas-table';
import quotaUsageBarChart from './quota-usage-bar-chart';

export default module => {
  module.filter('quotaName', quotaName);
  module.filter('quotaValue', quotaValue);
  module.component('quotasTable', quotasTable);
  module.component('quotaUsageBarChart', quotaUsageBarChart);
};
