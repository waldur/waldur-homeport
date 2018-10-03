import {APPSTORE_CATEGORY, ICON_CLASS} from '../constants';

// @ngInject
export default function registerAppstoreCategory(features, $q, AppstoreCategoriesService) {
  AppstoreCategoriesService.registerCategory(() => {
    if (!features.isVisible('pythonManagement')) {
      return $q.when([]);
    }

    return {
      key: '',
      label: 'Python management',
      icon: ICON_CLASS,
      image: '',
      description: 'Create manageable Python environment',
      category: APPSTORE_CATEGORY,
      state: 'appstore.pythonManagement',
    };
  });
}
