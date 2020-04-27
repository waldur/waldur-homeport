import customerCountryField from './customer-country-field';
import customerCreateDialog from './customer-create-dialog';
import CustomerCreateService from './customer-create-service';
import customerDomainField from './customer-domain-field';
import customerCreatePrompt from './CustomerCreatePromptContainer';

export default module => {
  module.component('customerCountryField', customerCountryField);
  module.component('customerDomainField', customerDomainField);
  module.component('customerCreateDialog', customerCreateDialog);
  module.component('customerCreatePrompt', customerCreatePrompt);
  module.service('CustomerCreateService', CustomerCreateService);
};
