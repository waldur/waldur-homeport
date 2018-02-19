import {APPSTORE_CATEGORY, FEATURE, ICON_CLASS} from './constants';

// @ngInject
export default function registerAppstoreCategory(features, $q, AnsiblePlaybooksService, AppstoreCategoriesService, ENV) {
  AppstoreCategoriesService.registerCategory(() => {
    if (!features.isVisible(FEATURE)) {
      return $q.when([]);
    }
    return AnsiblePlaybooksService.getAll()
      .then(playbooks => {
        const mappedPlaybooks = playbooks.map(playbook => ({
          key: playbook.uuid,
          label: playbook.name,
          icon: ICON_CLASS,
          image: playbook.image,
          description: playbook.description,
          category: APPSTORE_CATEGORY,
          state: 'appstore.ansible',
        }));
        addAnsibleCategoryIfEnabled(mappedPlaybooks);
        return mappedPlaybooks;
      });
  });

  function addAnsibleCategoryIfEnabled(mappedPlaybooks) {
    if (!ENV.disabledFeatures.includes('ansible')) {
      mappedPlaybooks.push.apply(mappedPlaybooks, buildAlwaysVisibleCategories());
    }
  }

  function buildAlwaysVisibleCategories() {
    const alwaysVisibleCategories = [];
    alwaysVisibleCategories.push({
      key: '',
      label: 'Python management',
      icon: ICON_CLASS,
      image: '',
      description: 'Create manageable python environment',
      category: APPSTORE_CATEGORY,
      state: 'appstore.pythonManagement',
    });
    return alwaysVisibleCategories;
  }
}
