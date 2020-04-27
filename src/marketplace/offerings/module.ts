import marketplacePauseOfferingDialog from './actions/PauseOfferingDialog';
import serviceSettingsDetailsDialog from './create/ServiceSettingsDetailsDialog';
import marketplaceOfferingDetailsDialog from './details/OfferingDetailsDialog';
import marketplacePreviewOfferingDialog from './PreviewOfferingDialog';

export default module => {
  module.component(
    'marketplaceOfferingDetailsDialog',
    marketplaceOfferingDetailsDialog,
  );
  module.component(
    'marketplacePauseOfferingDialog',
    marketplacePauseOfferingDialog,
  );
  module.component(
    'serviceSettingsDetailsDialog',
    serviceSettingsDetailsDialog,
  );
  module.component(
    'marketplacePreviewOfferingDialog',
    marketplacePreviewOfferingDialog,
  );
};
