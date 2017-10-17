import expertsService from './experts-service';
import expertProviderDetails from './expert-provider-details';
import bidsModule from './bids/module';
import requestsModule from './requests/module';
import extensionsModule from './extensions/module';
import expertRequestRoutes from './routes';
import ExpertUtilsService from './expert-utils-service';

export default module => {
  module.service('ExpertUtilsService', ExpertUtilsService);
  module.service('expertsService', expertsService);
  module.component('expertProviderDetails', expertProviderDetails);
  module.config(expertRequestRoutes);
  bidsModule(module);
  requestsModule(module);
  extensionsModule(module);
};
