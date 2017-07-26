import expertsService from './experts-service';
import expertProviderDetails from './expert-provider-details';
import bidsModule from './bids/module';
import requestsModule from './requests/module';
import expertRequestRoutes from './routes';
import registerSidebarExtension from './sidebar';
import registerExtensionPoint from './extension-point';
import extendTable from './extend-table';
import appstoreCategory from './appstore-category';

export default module => {
  module.service('expertsService', expertsService);
  module.component('expertProviderDetails', expertProviderDetails);
  module.config(expertRequestRoutes);
  module.run(registerSidebarExtension);
  module.run(registerExtensionPoint);
  module.run(extendTable);
  module.run(appstoreCategory);
  requestsModule(module);
  bidsModule(module);
};
