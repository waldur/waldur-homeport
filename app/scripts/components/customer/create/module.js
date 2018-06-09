import customerCountryField from './customer-country-field';
import customerCreateDialog from './customer-create-dialog';
import customerCreatePrompt from './CustomerCreatePromptContainer';
import CustomerCreateService from './customer-create-service';
import providersService from './providers-service';
import attachHooks from './hooks';

export default module => {
  module.component('customerCountryField', customerCountryField);
  module.component('customerCreateDialog', customerCreateDialog);
  module.component('customerCreatePrompt', customerCreatePrompt);
  module.service('CustomerCreateService', CustomerCreateService);
  module.service('providersService', providersService);
  module.run(attachHooks);
};
