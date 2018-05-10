import AppStoreUtilsService from './appstore-utils';
import appstoreSummary from './appstore-summary';
import appstoreStore from './appstore-store';
import appstoreRoutes from './routes';
import AppstoreFieldConfiguration from './field-configuration';
import AppstoreResourceLoader from './appstore-resource-loader';
import dialogModule from './dialog/module';
import providersModule from './providers/module';

export default module => {
  module.service('AppStoreUtilsService', AppStoreUtilsService);
  module.directive('appstoreSummary', appstoreSummary);
  module.component('appstoreStore', appstoreStore);
  module.config(appstoreRoutes);
  module.provider('AppstoreFieldConfiguration', AppstoreFieldConfiguration);
  module.service('AppstoreResourceLoader', AppstoreResourceLoader);
  dialogModule(module);
  providersModule(module);
};
