import {APPSTORE_CATEGORY, FEATURE, ICON_CLASS} from './constants';

// @ngInject
export default function registerAppstoreCategory(features, $q, AnsiblePlaybooksService, AppstoreCategoriesService) {
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
        addPythonManagementCategoryIfEnabled(mappedPlaybooks);
        return mappedPlaybooks;
      });
  });

  function addPythonManagementCategoryIfEnabled(mappedPlaybooks) {
    if (features.isVisible('pythonManagement')) {
      mappedPlaybooks.push.apply(mappedPlaybooks, buildPythonManagementCategory());
    }
  }

  function buildPythonManagementCategory() {
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
