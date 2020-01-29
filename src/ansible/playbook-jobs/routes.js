// @ngInject
export default function ansibleRoutes($stateProvider) {
  $stateProvider
    .state('project.resources.ansible', {
      url: 'applications/',
      template: '<ui-view></ui-view>',
      abstract: true,
    })

    .state('project.resources.ansible.list', {
      url: '',
      template: '<application-list></application-list>',
      data: {
        pageTitle: gettext('Applications'),
        feature: 'ansible'
      }
    })

    .state('project.resources.ansible.details', {
      url: ':jobId/',
      template: '<ansible-job-details></ansible-job-details>',
      data: {
        pageTitle: gettext('Application details'),
        pageClass: 'gray-bg',
        feature: 'ansible',
      }
    })
  ;
}
