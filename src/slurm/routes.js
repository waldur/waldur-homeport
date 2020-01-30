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
    });
}
