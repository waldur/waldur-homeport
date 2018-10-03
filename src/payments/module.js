import paymentsService from './payments-service';
import paymentApprove from './payment-approve';
import paymentCancel from './payment-cancel';
import paymentsList from './payment-list';
import paymentState from './payment-state';
import paymentRoutes from './routes';

export default module => {
  module.service('paymentsService', paymentsService);
  module.component('paymentApprove', paymentApprove);
  module.component('paymentCancel', paymentCancel);
  module.component('paymentsList', paymentsList);
  module.component('paymentState', paymentState);
  module.config(paymentRoutes);
};
