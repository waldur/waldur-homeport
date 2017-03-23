import AppStoreUtilsService from './appstore-utils';
import { AppStoreHeaderController, appstoreHeader } from './appstore-header';
import categorySelectorTabs from './category-selector-tabs';
import appstoreCategorySelector from './category-selector';
import appstoreProviders from './appstore-providers';
import appstoreSummary from './appstore-summary';
import appstoreStore from './appstore-store';
import appstoreRoutes from './routes';
import AppstoreFieldConfiguration from './field-configuration';
import AppstoreResourceLoader from './appstore-resource-loader';
import appstoreCompareList from './appstore-compare-list';

export default module => {
  module.service('AppStoreUtilsService', AppStoreUtilsService);
  module.controller('AppStoreHeaderController', AppStoreHeaderController);
  module.directive('appstoreHeader', appstoreHeader);
  module.component('categorySelectorTabs', categorySelectorTabs);
  module.component('appstoreCategorySelector', appstoreCategorySelector);
  module.component('appstoreProviders', appstoreProviders);
  module.component('appstoreCompareList', appstoreCompareList);
  module.directive('appstoreSummary', appstoreSummary);
  module.directive('appstoreStore', appstoreStore);
  module.config(appstoreRoutes);
  module.provider('AppstoreFieldConfiguration', AppstoreFieldConfiguration);
  module.service('AppstoreResourceLoader', AppstoreResourceLoader);
};
