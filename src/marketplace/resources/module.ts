import marketplaceResourceChangeLimitsDialog from './change-limits/ChangeLimitsDialog';
import marketplaceResourcePlanChangeDialog from './change-plan/ChangePlanDialog';
import marketplaceResourceImportDialog from './import/ResourceImportDialog';
import marketplaceKeyValueDialog from './MarketplaceKeyValueDialog';
import marketplacePlanUsageDialog from './plan-usage/PlanUsageDialog';
import marketplaceResourceTerminateDialog from './terminate/TerminateContainer';
import marketplaceResourceCreateUsageDialog from './usage/ResourceCreateUsageDialog';
import marketplaceResourceShowUsageDialog from './usage/ResourceShowUsageDialog';

export default module => {
  module.component(
    'marketplaceResourceShowUsageDialog',
    marketplaceResourceShowUsageDialog,
  );
  module.component(
    'marketplaceResourceCreateUsageDialog',
    marketplaceResourceCreateUsageDialog,
  );
  module.component(
    'marketplaceResourcePlanChangeDialog',
    marketplaceResourcePlanChangeDialog,
  );
  module.component(
    'marketplaceResourceChangeLimitsDialog',
    marketplaceResourceChangeLimitsDialog,
  );
  module.component('marketplacePlanUsageDialog', marketplacePlanUsageDialog);
  module.component(
    'marketplaceResourceTerminateDialog',
    marketplaceResourceTerminateDialog,
  );
  module.component(
    'marketplaceResourceImportDialog',
    marketplaceResourceImportDialog,
  );
  module.component('marketplaceKeyValueDialog', marketplaceKeyValueDialog);
};
