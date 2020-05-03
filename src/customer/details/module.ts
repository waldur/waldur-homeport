import { connectAngularComponent } from '@waldur/store/connect';

import customerManage from './customer-manage';
import customerPolicies from './customer-policies';
import customerReportError from './customer-report-error';
import customerThreshold from './customer-threshold';
import customerDetails from './CustomerDetails';
import customerEditDetails from './CustomerEditDetailsContainer';
import { PaymentProfileDetails } from './PaymentProfileDetails';
import { PaymentProfileList } from './PaymentProfileList';

export default module => {
  module.component('customerDetails', customerDetails);
  module.component('customerEditDetails', customerEditDetails);
  module.component('customerManage', customerManage);
  module.component('customerPolicies', customerPolicies);
  module.component('customerReportError', customerReportError);
  module.component('customerThreshold', customerThreshold);
  module.component(
    'paymentProfileList',
    connectAngularComponent(PaymentProfileList),
  );
  module.component(
    'paymentProfileForOrganizationOwner',
    connectAngularComponent(PaymentProfileDetails),
  );
};
