import appstoreCategorySelector from './category-selector';
import appstoreOffering from './appstore-offering';
import appstoreSupportAgreement from './appstore-support-agreement';
import appstoreSummary from './appstore-summary';
import appstoreRoutes from './routes';
import AppstoreFieldConfiguration from './field-configuration';

export default module => {
  module.directive('appstoreCategorySelector', appstoreCategorySelector);
  module.directive('appstoreOffering', appstoreOffering);
  module.directive('appstoreSupportAgreement', appstoreSupportAgreement);
  module.directive('appstoreSummary', appstoreSummary);
  module.config(appstoreRoutes);
  module.provider('AppstoreFieldConfiguration', AppstoreFieldConfiguration);
}
