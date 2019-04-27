import marketplaceProviderDetails from './ProviderDetails';
import marketplaceServiceProviderManagement from './ServiceProviderManagement';
import marketplaceServiceProviderSecretCodeGenerateConfirm from './ServiceProviderSecretCodeGenerateConfirm';

export default module => {
  module.component('marketplaceProviderDetails', marketplaceProviderDetails);
  module.component('marketplaceServiceProviderManagement', marketplaceServiceProviderManagement);
  module.component('marketplaceServiceProviderSecretCodeGenerateConfirm', marketplaceServiceProviderSecretCodeGenerateConfirm);
};
