import customerCountryField from './customer-country-field';
import customerCreateDialog from './customer-create-dialog';
import customerCreatePrompt from './customer-create-prompt';
import CustomerCreateService from './customer-create-service';
import attachHooks from './hooks';

export default module => {
  module.component('customerCountryField', customerCountryField);
  module.component('customerCreateDialog', customerCreateDialog);
  module.component('customerCreatePrompt', customerCreatePrompt);
  module.service('CustomerCreateService', CustomerCreateService);
  module.run(attachHooks);
};
