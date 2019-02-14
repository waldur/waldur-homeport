import marketplaceProjectResourcesList from './ProjectResourcesContainer';
import marketplaceResourceShowUsageButton from './ResourceShowUsageButton';
import marketplaceResourceShowUsageDialog from './ResourceShowUsageDialog';
import marketplaceResourceCreateUsageDialog from './ResourceCreateUsageDialog';
import marketplaceResourcePlanChangeDialog from './ChangePlanDialog';
import marketplacePlanUsagesList from './PlanUsageContainer';

export default module => {
  module.component('marketplaceProjectResourcesList', marketplaceProjectResourcesList);
  module.component('marketplaceResourceShowUsageButton', marketplaceResourceShowUsageButton);
  module.component('marketplaceResourceShowUsageDialog', marketplaceResourceShowUsageDialog);
  module.component('marketplaceResourceCreateUsageDialog', marketplaceResourceCreateUsageDialog);
  module.component('marketplaceResourcePlanChangeDialog', marketplaceResourcePlanChangeDialog);
  module.component('marketplacePlanUsagesList', marketplacePlanUsagesList);
};
