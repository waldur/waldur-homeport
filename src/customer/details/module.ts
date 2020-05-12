import { connectAngularComponent } from '@waldur/store/connect';

import customerPoliciesPanel from './customer-policies';
import customerThreshold from './customer-threshold';
import customerEditDetails from './CustomerEditDetailsContainer';
import { CustomerErrorDialog } from './CustomerErrorDialog';

export default module => {
  module.component('customerEditDetails', customerEditDetails);
  module.component('customerPoliciesPanel', customerPoliciesPanel);
  module.component(
    'customerErrorDialog',
    connectAngularComponent(CustomerErrorDialog, ['resolve']),
  );
  module.component('customerThreshold', customerThreshold);
};
