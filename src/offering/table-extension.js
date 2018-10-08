// @ngInject
export default function extendTable(TableExtensionService) {
  TableExtensionService.registerColumns('projects-list', [{
    key: 'offerings',
    title: gettext('Requests'),
    render: row => row.offering_count || 0,
    feature: 'offering',
    index: 160,
  }]);

  TableExtensionService.registerColumns('customer-list', [{
    key: 'offerings',
    title: gettext('Requests'),
    render: row => row.offering_count || 0,
    feature: 'offering',
    index: 160,
  }]);
}
