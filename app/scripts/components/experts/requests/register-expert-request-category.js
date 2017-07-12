// @ngInject
export default function registerExpertRequestCategory(features, $q, expertRequestsService, AppstoreCategoriesService) {
  AppstoreCategoriesService.registerCategory(() => {
    if (!features.isVisible('experts')) {
      return $q.when([]);
    }
    return expertRequestsService.getConfiguration()
      .then(experts => {
        return Object.keys(experts).map(key => ({
          key,
          label: experts[key].label,
          icon: experts[key].icon || 'fa-gear',
          description: experts[key].description,
          category: experts[key].category || gettext('Experts'),
          state: 'appstore.expert',
        }));
      }).catch(error => {
        if (error.status === 424) {
          return [];
        }
        throw error;
      });
  });
}
