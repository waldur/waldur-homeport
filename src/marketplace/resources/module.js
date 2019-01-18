import marketplaceProjectResourcesList from './ProjectResourcesContainer';
import marketplaceResourceShowUsageButton from './ResourceShowUsageButton';
import marketplaceResourceShowUsageDialog from './ResourceShowUsageDialog';
import marketplaceResourceCreateUsageDialog from './ResourceCreateUsageDialog';

export default module => {
  module.component('marketplaceProjectResourcesList', marketplaceProjectResourcesList);
  module.component('marketplaceResourceShowUsageButton', marketplaceResourceShowUsageButton);
  module.component('marketplaceResourceShowUsageDialog', marketplaceResourceShowUsageDialog);
  module.component('marketplaceResourceCreateUsageDialog', marketplaceResourceCreateUsageDialog);
};
