import marketplaceCustomerResourcesList from './list/CustomerResourcesContainer';
import marketplaceProjectResourcesList from './list/ProjectResourcesContainer';
import marketplacePublicResourcesList from './list/PublicResourcesContainer';
import marketplaceSupportResourcesList from './list/SupportResourcesContainer';
import marketplaceResourceShowUsageButton from './usage/ResourceShowUsageButton';
import marketplaceResourceShowUsageDialog from './usage/ResourceShowUsageDialog';
import marketplaceResourceCreateUsageDialog from './usage/ResourceCreateUsageDialog';
import marketplaceSupportUsageList from './usage/SupportUsageContainer';
import marketplaceResourcePlanChangeDialog from './change-plan/ChangePlanDialog';
import marketplaceResourceChangeLimitsDialog from './change-limits/ChangeLimitsDialog';
import marketplacePlanUsagesList from './plan-usage/PlanUsageContainer';
import marketplacePlanUsageDialog from './plan-usage/PlanUsageDialog';
import marketplaceResourceTerminateDialog from './terminate/TerminateContainer';

export default module => {
  module.component('marketplaceCustomerResourcesList', marketplaceCustomerResourcesList);
  module.component('marketplaceProjectResourcesList', marketplaceProjectResourcesList);
  module.component('marketplacePublicResourcesList', marketplacePublicResourcesList);
  module.component('marketplaceSupportResourcesList', marketplaceSupportResourcesList);
  module.component('marketplaceResourceShowUsageButton', marketplaceResourceShowUsageButton);
  module.component('marketplaceResourceShowUsageDialog', marketplaceResourceShowUsageDialog);
  module.component('marketplaceResourceCreateUsageDialog', marketplaceResourceCreateUsageDialog);
  module.component('marketplaceSupportUsageList', marketplaceSupportUsageList);
  module.component('marketplaceResourcePlanChangeDialog', marketplaceResourcePlanChangeDialog);
  module.component('marketplaceResourceChangeLimitsDialog', marketplaceResourceChangeLimitsDialog);
  module.component('marketplacePlanUsagesList', marketplacePlanUsagesList);
  module.component('marketplacePlanUsageDialog', marketplacePlanUsageDialog);
  module.component('marketplaceResourceTerminateDialog', marketplaceResourceTerminateDialog);
};
