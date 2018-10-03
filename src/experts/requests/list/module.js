import expertRequestsCustomerList from './expert-request-customer-list';
import expertRequestsProjectList from './expert-request-project-list';

export default module => {
  module.component('expertRequestsCustomerList', expertRequestsCustomerList);
  module.component('expertRequestsProjectList', expertRequestsProjectList);
};
