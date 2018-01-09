import providerDialog from './dialog';
import providerDetails from './provider-details';
import providerProjectLinkQuotas from './provider-project-link-quotas';
import providerProjects from './provider-projects';
import providerPrices from './provider-prices';
import providerPriceList from './provider-price-list';
import providerProjectLinkQuota from './provider-project-link-quota';
import ProviderUtilsService from './provider-utils-service';

export default module => {
  module.component('providerDialog', providerDialog);
  module.component('providerDetails', providerDetails);
  module.component('providerProjectLinkQuotas', providerProjectLinkQuotas);
  module.component('providerProjectLinkQuota', providerProjectLinkQuota);
  module.directive('providerProjects', providerProjects);
  module.component('providerPrices', providerPrices);
  module.component('providerPriceList', providerPriceList);
  module.service('ProviderUtilsService', ProviderUtilsService);
};
