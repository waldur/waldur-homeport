// @ngInject
export default function slurmRoutes($stateProvider) {
  $stateProvider
    .state('project.resources.slurm', {
      url: 'batch/',
      template: '<slurm-allocation-list></slurm-allocation-list>',
      data: {
        pageTitle: gettext('Batch processing'),
        feature: 'slurm'
      }
    })

    .state('appstore.slurm', {
      url: 'batch/',
      template: '<appstore-store></appstore-store>',
      data: {
        category: 'slurm',
        pageTitle: gettext('Batch processing'),
        sidebarState: 'project.resources',
        feature: 'slurm',
      }
    });
}
