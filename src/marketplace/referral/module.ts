import { OfferingReferralsDialog } from '@waldur/marketplace/referral/OfferingReferralsDialog';
import { connectAngularComponent } from '@waldur/store/connect';

export default module => {
  module.component(
    'marketplaceOfferingReferralsDialog',
    connectAngularComponent(OfferingReferralsDialog, ['resolve']),
  );
};
