import providerDetails from './dialog';
import providerProjects from './provider-projects';
import providerPrices from './provider-prices';
import providerSettings from './provider-settings';

export default module => {
  module.directive('providerDetails', providerDetails);
  module.directive('providerProjects', providerProjects);
  module.directive('providerPrices', providerPrices);
  module.directive('providerSettings', providerSettings);
};
