import {APPSTORE_CATEGORY, FEATURE, ICON_CLASS} from '../constants';

// @ngInject
export default function registerAppstoreCategory(features, $q, AnsiblePlaybooksService, AppstoreCategoriesService) {
  AppstoreCategoriesService.registerCategory(() => {
    if (!features.isVisible(FEATURE)) {
      return $q.when([]);
    }
    return AnsiblePlaybooksService.getAll()
      .then(playbooks => {
        return playbooks.map(playbook => ({
          key: playbook.uuid,
          label: playbook.name,
          icon: ICON_CLASS,
          image: playbook.image,
          description: playbook.description,
          category: APPSTORE_CATEGORY,
          state: 'appstore.ansible',
        }));
      });
  });
}
