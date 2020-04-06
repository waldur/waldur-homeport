import { connectAngularComponent } from '@waldur/store/connect';

import billingDetails from './billing-details';
import billingRecordDetails from './billing-record-details';
import billingRecordHeader from './billing-record-header';
import billingRecordsList from './billing-records-list';
import billingTabs from './billing-tabs';
import BillingUtils from './billing-utils';
import billingCustomerDetails from './CustomerDetails';
import eventsModule from './events/module';
import invoiceDetails from './invoice-details';
import invoiceHeader from './invoice-header';
import invoicesList from './invoices-list';
import invoicesService from './invoices-service';
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
  module.component('invoicesList', invoicesList);
  module.component('billingCustomerDetails', billingCustomerDetails);
  module.component('billingRecordDetails', billingRecordDetails);
  module.component('billingRecordHeader', billingRecordHeader);
  module.component('billingRecordsList', billingRecordsList);
  module.component('billingTabs', billingTabs);
  module.component('priceEstimateButton', priceEstimateButton);
  module.component('priceEstimateDialog', priceEstimateDialog);
  module.component(
    'paymentProfileList',
    connectAngularComponent(PaymentProfileList),
  );
  module.config(billingRoutes);
  eventsModule(module);
};
