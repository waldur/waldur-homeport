import ansibleJobCreate from './ansible-job-create';
import ansibleJobCheckoutSummary from './ansible-job-checkout-summary';

export default module => {
  module.component('ansibleJobCreate', ansibleJobCreate);
  module.component('ansibleJobCheckoutSummary', ansibleJobCheckoutSummary);
};
