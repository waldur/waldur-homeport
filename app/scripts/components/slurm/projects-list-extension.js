function getAllocationCount(project) {
  const matches = project.quotas.filter(quota => quota.name === 'nc_allocation_count');
  if (matches.length === 0) {
    return 0;
  }
  return matches[0].usage;
}

export default function extendTable(TableExtensionService) {
  TableExtensionService.registerColumns('projects-list', [
    {
      title: gettext('Allocations'),
      render: row => getAllocationCount(row),
      feature: 'slurm',
      index: 140,
    }
  ]);
}
