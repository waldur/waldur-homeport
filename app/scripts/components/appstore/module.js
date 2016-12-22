import AppStoreUtilsService from './appstore-utils';
import { AppStoreHeaderController, appstoreHeader } from './appstore-header';
import appstoreCategorySelector from './category-selector';
import appstoreProviders from './appstore-providers';
import appstoreOffering from './appstore-offering';
import appstoreSummary from './appstore-summary';
import appstoreStore from './appstore-store';
import appstoreRoutes from './routes';
import AppstoreFieldConfiguration from './field-configuration';

export default module => {
  module.service('AppStoreUtilsService', AppStoreUtilsService);
  module.controller('AppStoreHeaderController', AppStoreHeaderController);
  module.directive('appstoreHeader', appstoreHeader);
  module.directive('appstoreCategorySelector', appstoreCategorySelector);
  module.directive('appstoreProviders', appstoreProviders);
  module.directive('appstoreOffering', appstoreOffering);
  module.directive('appstoreSummary', appstoreSummary);
  module.directive('appstoreStore', appstoreStore);
  module.config(appstoreRoutes);
  module.provider('AppstoreFieldConfiguration', AppstoreFieldConfiguration);
};
