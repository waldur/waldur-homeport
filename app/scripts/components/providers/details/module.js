import providerDialog from './dialog';
import providerDetails from './provider-details';
import providerProjects from './provider-projects';
import providerPrices from './provider-prices';
import providerPriceList from './provider-price-list';
import providerSettings from './provider-settings';

export default module => {
  module.component('providerDialog', providerDialog);
  module.component('providerDetails', providerDetails);
  module.directive('providerProjects', providerProjects);
  module.component('providerPrices', providerPrices);
  module.component('providerPriceList', providerPriceList);
  module.directive('providerSettings', providerSettings);
};
