import { connectAngularComponent } from '@waldur/store/connect';

import marketplacePauseOfferingDialog from './actions/PauseOfferingDialog';
import marketplaceOfferingCreate from './create/OfferingCreateContainer';
import serviceSettingsDetailsDialog from './create/ServiceSettingsDetailsDialog';
import marketplaceOfferingDetailsPage from './details/OfferingContainer';
import marketplaceOfferingDetailsDialog from './details/OfferingDetailsDialog';
import { PublicOfferingDetails } from './details/PublicOfferingDetails';
import marketplaceMyOfferings from './MyOfferingsListContainer';
import marketplaceVendorOfferings from './OfferingsListContainer';
import marketplacePreviewOfferingDialog from './PreviewOfferingDialog';
import marketplaceOfferingUpdate from './update/OfferingUpdateContainer';

export default module => {
  module.component('marketplaceVendorOfferings', marketplaceVendorOfferings);
  module.component('marketplaceMyOfferings', marketplaceMyOfferings);
  module.component('marketplaceOfferingCreate', marketplaceOfferingCreate);
  module.component('marketplaceOfferingUpdate', marketplaceOfferingUpdate);
  module.component(
    'marketplaceOfferingDetailsPage',
    marketplaceOfferingDetailsPage,
  );
  module.component(
    'marketplacePublicOfferingDetailsPage',
    connectAngularComponent(PublicOfferingDetails),
  );
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
