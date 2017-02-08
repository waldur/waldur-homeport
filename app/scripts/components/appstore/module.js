import AppStoreUtilsService from './appstore-utils';
import { AppStoreHeaderController, appstoreHeader } from './appstore-header';
import categorySelectorTabs from './category-selector-tabs';
import appstoreCategorySelector from './category-selector';
import appstoreProviders from './appstore-providers';
import offeringsService from './appstore-offerings-service';
import projectOfferingsList from './project-offerings-list';
import appstoreOffering from './appstore-offering';
import appstoreSummary from './appstore-summary';
import appstoreStore from './appstore-store';
import appstoreRoutes from './routes';
import AppstoreFieldConfiguration from './field-configuration';

export default module => {
  module.service('AppStoreUtilsService', AppStoreUtilsService);
  module.controller('AppStoreHeaderController', AppStoreHeaderController);
  module.directive('appstoreHeader', appstoreHeader);
  module.component('categorySelectorTabs', categorySelectorTabs);
  module.component('appstoreCategorySelector', appstoreCategorySelector);
  module.directive('appstoreProviders', appstoreProviders);
  module.service('offeringsService', offeringsService);
  module.component('projectOfferingsList', projectOfferingsList);
  module.component('appstoreOffering', appstoreOffering);
  module.directive('appstoreSummary', appstoreSummary);
  module.directive('appstoreStore', appstoreStore);
  module.config(appstoreRoutes);
  module.provider('AppstoreFieldConfiguration', AppstoreFieldConfiguration);
};
