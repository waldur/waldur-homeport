import expertsService from './experts-service';
import expertProviderDetails from './expert-provider-details';
import bidsModule from './bids/module';
import requestsModule from './requests/module';
import extensionsModule from './extensions/module'
import expertRequestRoutes from './routes';

export default module => {
  module.service('expertsService', expertsService);
  module.component('expertProviderDetails', expertProviderDetails);
  module.config(expertRequestRoutes);
  requestsModule(module);
  bidsModule(module);
  extensionsModule(module);
};
