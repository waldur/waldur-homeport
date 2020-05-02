import { connectAngularComponent } from '@waldur/store/connect';

import BillingUtils from './billing-utils';
import eventsModule from './events/module';
import invoicesService from './invoices-service';
import { PaymentProfileDetails } from './PaymentProfileDetails';
import { PaymentProfileList } from './PaymentProfileList';
import priceEstimateButton from './price-estimate-button';
import PriceEstimateUtilsService from './price-estimate-utils-service';
import priceEstimateDialog from './PriceEstimateDialog';
import billingRoutes from './routes';
import './events';

export default module => {
  module.service('invoicesService', invoicesService);
  module.service('BillingUtils', BillingUtils);
  module.service('PriceEstimateUtilsService', PriceEstimateUtilsService);
  module.component('priceEstimateButton', priceEstimateButton);
  module.component('priceEstimateDialog', priceEstimateDialog);
  module.component(
    'paymentProfileList',
    connectAngularComponent(PaymentProfileList),
  );
  module.component(
    'paymentProfileForOrganizationOwner',
    connectAngularComponent(PaymentProfileDetails),
  );
  module.config(billingRoutes);
  eventsModule(module);
};
