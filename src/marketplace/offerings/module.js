import marketplaceVendorOfferings from './OfferingsListContainer';
import marketplaceMyOfferings from './MyOfferingsListContainer';
import marketplaceOfferingCreate from './create/OfferingCreateContainer';
import marketplaceOfferingUpdate from './update/OfferingUpdateContainer';
import marketplaceOfferingDetailsPage from './details/OfferingContainer';
import marketplaceOfferingDetailsButton from './details/OfferingDetailsButton';
import marketplaceOfferingDetailsDialog from './details/OfferingDetailsDialog';
import marketplacePauseOfferingDialog from './actions/PauseOfferingDialog';

export default module => {
  module.component('marketplaceVendorOfferings', marketplaceVendorOfferings);
  module.component('marketplaceMyOfferings', marketplaceMyOfferings);
  module.component('marketplaceOfferingCreate', marketplaceOfferingCreate);
  module.component('marketplaceOfferingUpdate', marketplaceOfferingUpdate);
  module.component('marketplaceOfferingDetailsPage', marketplaceOfferingDetailsPage);
  module.component('marketplaceOfferingDetailsButton', marketplaceOfferingDetailsButton);
  module.component('marketplaceOfferingDetailsDialog', marketplaceOfferingDetailsDialog);
  module.component('marketplacePauseOfferingDialog', marketplacePauseOfferingDialog);
};
