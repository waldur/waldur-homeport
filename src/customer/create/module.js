import customerCountryField from './customer-country-field';
import customerDomainField from './customer-domain-field';
import customerCreateDialog from './customer-create-dialog';
import customerCreatePrompt from './CustomerCreatePromptContainer';
import CustomerCreateService from './customer-create-service';

export default module => {
  module.component('customerCountryField', customerCountryField);
  module.component('customerDomainField', customerDomainField);
  module.component('customerCreateDialog', customerCreateDialog);
  module.component('customerCreatePrompt', customerCreatePrompt);
  module.service('CustomerCreateService', CustomerCreateService);
};
