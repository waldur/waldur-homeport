import providerDetails from './dialog';
import providerProjects from './provider-projects';
import providerPrices from './provider-prices';
import providerPriceList from './provider-price-list';
import providerSettings from './provider-settings';

export default module => {
  module.directive('providerDetails', providerDetails);
  module.directive('providerProjects', providerProjects);
  module.component('providerPrices', providerPrices);
  module.component('providerPriceList', providerPriceList);
  module.directive('providerSettings', providerSettings);
};
