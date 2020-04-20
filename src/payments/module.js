import { connectAngularComponent } from '@waldur/store/connect';

import paymentApprove from './payment-approve';
import paymentCancel from './payment-cancel';
import paymentsService from './payments-service';
import { PaymentsList } from './PaymentsList';
import paymentRoutes from './routes';

export default module => {
  module.service('paymentsService', paymentsService);
  module.component('paymentApprove', paymentApprove);
  module.component('paymentCancel', paymentCancel);
  module.component('paymentsList', connectAngularComponent(PaymentsList));
  module.config(paymentRoutes);
};
