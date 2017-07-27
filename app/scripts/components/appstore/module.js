import AppStoreUtilsService from './appstore-utils';
import AppstoreProvidersService from './appstore-providers-service';
import { AppStoreHeaderController, appstoreHeader } from './appstore-header';
import appstoreProviders from './appstore-providers';
import appstoreSummary from './appstore-summary';
import appstoreStore from './appstore-store';
import appstoreRoutes from './routes';
import AppstoreFieldConfiguration from './field-configuration';
import AppstoreResourceLoader from './appstore-resource-loader';
import appstoreCompareList from './appstore-compare-list';
import dialogModule from './dialog/module';

export default module => {
  module.service('AppStoreUtilsService', AppStoreUtilsService);
  module.service('AppstoreProvidersService', AppstoreProvidersService);
  module.controller('AppStoreHeaderController', AppStoreHeaderController);
  module.directive('appstoreHeader', appstoreHeader);
  module.component('appstoreProviders', appstoreProviders);
  module.component('appstoreCompareList', appstoreCompareList);
  module.directive('appstoreSummary', appstoreSummary);
  module.directive('appstoreStore', appstoreStore);
  module.config(appstoreRoutes);
  module.provider('AppstoreFieldConfiguration', AppstoreFieldConfiguration);
  module.service('AppstoreResourceLoader', AppstoreResourceLoader);
  dialogModule(module);
};
