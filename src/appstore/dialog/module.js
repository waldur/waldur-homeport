import appstoreCategorySelector from './appstore-category-selector';
import appstoreProjectSelector from './appstore-project-selector';
import appstoreSelectorDialog from './appstore-selector-dialog';
import AppstoreCategoriesService from './appstore-category-service';

export default module => {
  module.component('appstoreCategorySelector', appstoreCategorySelector);
  module.component('appstoreProjectSelector', appstoreProjectSelector);
  module.component('appstoreSelectorDialog', appstoreSelectorDialog);
  module.service('AppstoreCategoriesService', AppstoreCategoriesService);
};
