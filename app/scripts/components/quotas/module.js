import { quotaName, quotaValue } from './filters';
import quotasTable from './quotas-table';

export default module => {
  module.filter('quotaName', quotaName);
  module.filter('quotaValue', quotaValue);
  module.component('quotasTable', quotasTable);
};
