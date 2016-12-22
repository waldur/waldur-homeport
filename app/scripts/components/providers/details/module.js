import providerDetails from './dialog';
import providerProjects from './provider-projects';
import providerPrices from './provider-prices';
import providerQuotas from './provider-quotas';
import providerSettings from './provider-settings';
import { quotaName, quotaValue } from './filters';

export default module => {
  module.directive('providerDetails', providerDetails);
  module.directive('providerProjects', providerProjects);
  module.directive('providerPrices', providerPrices);
  module.directive('providerQuotas', providerQuotas);
  module.directive('providerSettings', providerSettings);
  module.filter('quotaName', quotaName);
  module.filter('quotaValue', quotaValue);
};
