// @ngInject
export default function registerAppstoreCategory(features, $q, AnsiblePlaybooksService, AppstoreCategoriesService) {
  AppstoreCategoriesService.registerCategory(() => {
    if (!features.isVisible('ansible')) {
      return $q.when([]);
    }
    return AnsiblePlaybooksService.getAll()
      .then(playbooks => {
        return playbooks.map(playbook => ({
          key: playbook.uuid,
          label: playbook.name,
          icon: 'fa-book',
          description: playbook.description,
          category: gettext('Applications'),
          state: 'appstore.ansible',
        }));
      });
  });
}
