import marketplacePauseOfferingDialog from './actions/PauseOfferingDialog';
import marketplaceAddOfferingScreenshotDialog from './AddOfferingScreenshotDialog';
import serviceSettingsDetailsDialog from './create/ServiceSettingsDetailsDialog';
import marketplaceOfferingDetailsDialog from './details/OfferingDetailsDialog';
import marketplacePreviewOfferingDialog from './PreviewOfferingDialog';
import marketplaceViewOfferingScreenshotDialog from './ViewOfferingScreenshotDialog';

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
  module.component(
    'marketplaceAddOfferingScreenshotDialog',
    marketplaceAddOfferingScreenshotDialog,
  );
  module.component(
    'marketplaceViewOfferingScreenshotDialog',
    marketplaceViewOfferingScreenshotDialog,
  );
};
