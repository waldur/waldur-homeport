import ansibleJobCreate from './ansible-job-create';
import ansibleJobCheckoutSummary from './ansible-job-checkout-summary';
import ansiblePriceExplanation from './ansible-price-explanation';

export default module => {
  module.component('ansibleJobCreate', ansibleJobCreate);
  module.component('ansibleJobCheckoutSummary', ansibleJobCheckoutSummary);
  module.component('ansiblePriceExplanation', ansiblePriceExplanation);
};
