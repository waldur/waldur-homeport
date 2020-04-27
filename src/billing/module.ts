import { connectAngularComponent } from '@waldur/store/connect';

import { AgreementInfo } from './AgreementInfo';
import billingDetails from './billing-details';
import billingRecordHeader from './billing-record-header';
import billingTabs from './billing-tabs';
import BillingUtils from './billing-utils';
import { BillingRecordDetails } from './BillingRecordDetails';
import { BillingRecordsList } from './BillingRecordsList';
import billingCustomerDetails from './CustomerDetails';
import eventsModule from './events/module';
import invoiceDetails from './invoice-details';
import invoiceHeader from './invoice-header';
import invoicesService from './invoices-service';
import { InvoicesList } from './InvoicesList';
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
  module.component('billingDetails', billingDetails);
  module.component('invoiceHeader', invoiceHeader);
  module.component('invoiceDetails', invoiceDetails);
  module.component('invoicesList', connectAngularComponent(InvoicesList));
  module.component('billingCustomerDetails', billingCustomerDetails);
  module.component(
    'billingRecordDetails',
    connectAngularComponent(BillingRecordDetails, ['invoice']),
  );
  module.component('billingRecordHeader', billingRecordHeader);
  module.component(
    'billingRecordsList',
    connectAngularComponent(BillingRecordsList),
  );
  module.component('agreementInfo', connectAngularComponent(AgreementInfo));
  module.component('billingTabs', billingTabs);
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
