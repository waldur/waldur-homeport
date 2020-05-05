import { connectAngularComponent } from '@waldur/store/connect';

import { PaymentProfileList } from './PaymentProfileList';
import paymentProfileUpdateDialog from './PaymentProfileUpdateDialog';

export default module => {
  module.component(
    'paymentProfileList',
    connectAngularComponent(PaymentProfileList),
  );
  module.component('paymentProfileUpdateDialog', paymentProfileUpdateDialog);
};
