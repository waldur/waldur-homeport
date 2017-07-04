import backButton from './back-button';
import { CustomerBalanceController, customerBalance } from './customer-balance';
import expandableIndicator from './expandable-indicator';
import importResourceButton from './import-resource-button';
import importableResources from './importable-resources';
import lineChart from './line-chart';
import stopPropagation from './stoppropagation';

export default module => {
  module.directive('backButton', backButton);
  module.controller('CustomerBalanceController', CustomerBalanceController);
  module.directive('customerBalance', customerBalance);
  module.directive('expandableIndicator', expandableIndicator);
  module.directive('importResourceButton', importResourceButton);
  module.directive('importableResources', importableResources);
  module.directive('lineChart', lineChart);
  module.directive('stoppropagation', stopPropagation);
};
