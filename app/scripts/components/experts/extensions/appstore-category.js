import { APPSTORE_CATEGORY } from '../constants';

// @ngInject
export default function registerExpertRequestCategory(features, $q, expertRequestsService, AppstoreCategoriesService) {
  AppstoreCategoriesService.registerCategory(() => {
    if (!features.isVisible('experts')) {
      return $q.when([]);
    }
    return expertRequestsService.getConfiguration()
      .then(config => {
        const experts = config.offerings || [];
        return Object.keys(experts).map(key => ({
          key,
          label: experts[key].label,
          icon: experts[key].icon || 'fa-gear',
          image: experts[key].image,
          description: experts[key].description,
          category: APPSTORE_CATEGORY,
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
