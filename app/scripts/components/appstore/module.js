import appstoreCategorySelector from './category-selector';
import appstoreOffering from './appstore-offering';
import appstoreRoutes from './routes';

export default module => {
  module.directive('appstoreCategorySelector', appstoreCategorySelector);
  module.directive('appstoreOffering', appstoreOffering);
  module.config(appstoreRoutes);
}
