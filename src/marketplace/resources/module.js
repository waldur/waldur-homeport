import marketplaceResourceChangeLimitsDialog from './change-limits/ChangeLimitsDialog';
import marketplaceResourcePlanChangeDialog from './change-plan/ChangePlanDialog';
import marketplaceResourceImportDialog from './import/ResourceImportDialog';
import marketplaceCustomerResourcesList from './list/CustomerResourcesContainer';
import marketplaceProjectResourcesList from './list/ProjectResourcesContainer';
import marketplacePublicResourcesList from './list/PublicResourcesContainer';
import marketplaceSupportResourcesList from './list/SupportResourcesContainer';
import marketplacePlanUsagesList from './plan-usage/PlanUsageContainer';
import marketplacePlanUsageDialog from './plan-usage/PlanUsageDialog';
import marketplaceResourceDetails from './ResourceDetailsPage';
import marketplaceResourceTerminateDialog from './terminate/TerminateContainer';
import marketplaceResourceCreateUsageDialog from './usage/ResourceCreateUsageDialog';
import marketplaceResourceShowUsageButton from './usage/ResourceShowUsageButton';
import marketplaceResourceShowUsageDialog from './usage/ResourceShowUsageDialog';
import marketplaceSupportUsageList from './usage/SupportUsageContainer';

export default module => {
  module.component(
    'marketplaceCustomerResourcesList',
    marketplaceCustomerResourcesList,
  );
  module.component(
    'marketplaceProjectResourcesList',
    marketplaceProjectResourcesList,
  );
  module.component(
    'marketplacePublicResourcesList',
    marketplacePublicResourcesList,
  );
  module.component(
    'marketplaceSupportResourcesList',
    marketplaceSupportResourcesList,
  );
  module.component(
    'marketplaceResourceShowUsageButton',
    marketplaceResourceShowUsageButton,
  );
  module.component(
    'marketplaceResourceShowUsageDialog',
    marketplaceResourceShowUsageDialog,
  );
  module.component(
    'marketplaceResourceCreateUsageDialog',
    marketplaceResourceCreateUsageDialog,
  );
  module.component('marketplaceSupportUsageList', marketplaceSupportUsageList);
  module.component(
    'marketplaceResourcePlanChangeDialog',
    marketplaceResourcePlanChangeDialog,
  );
  module.component(
    'marketplaceResourceChangeLimitsDialog',
    marketplaceResourceChangeLimitsDialog,
  );
  module.component('marketplacePlanUsagesList', marketplacePlanUsagesList);
  module.component('marketplacePlanUsageDialog', marketplacePlanUsageDialog);
  module.component(
    'marketplaceResourceTerminateDialog',
    marketplaceResourceTerminateDialog,
  );
  module.component(
    'marketplaceResourceImportDialog',
    marketplaceResourceImportDialog,
  );
  module.component('marketplaceResourceDetails', marketplaceResourceDetails);
};
