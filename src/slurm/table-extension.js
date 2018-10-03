// @ngInject
export default function extendTable(TableExtensionService) {
  const column = {
    key: 'allocations',
    title: gettext('Allocations'),
    render: row => row.allocation_count,
    feature: 'slurm',
    index: 140,
  };

  TableExtensionService.registerColumns('projects-list', [column]);
  TableExtensionService.registerColumns('customer-list', [column]);
}
