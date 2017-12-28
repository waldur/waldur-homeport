// @ngInject
export default function extendTable(TableExtensionService, ncUtils) {
  TableExtensionService.registerColumns('projects-list', [{
    title: gettext('Experts'),
    render: row => row.expert_count || 0,
    feature: 'experts',
    index: 150,
  }]);

  TableExtensionService.registerColumns('user-organizations', [
    {
      title: gettext('Expert'),
      className: 'text-center min-tablet-l',
      render: row => ncUtils.booleanField(row.is_expert_provider),
      width: '50px',
      feature: 'experts',
    }
  ]);
}
