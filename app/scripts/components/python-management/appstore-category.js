// @ngInject
export default function registerAppstoreCategory(features, $q, AppstoreCategoriesService) {
  AppstoreCategoriesService.registerCategory(() => {
    if (!features.isVisible('pythonManagement')) {
      return $q.when([]);
    }

    return {
      key: '',
      label: 'Python management',
      icon: 'fa-rocket',
      image: '',
      description: 'Create manageable python environment',
      category: 'Applications',
      state: 'appstore.pythonManagement',
    };
  });
}
