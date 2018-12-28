import {APPSTORE_CATEGORY} from '../constants';

// @ngInject
export default function ansibleRoutes($stateProvider) {
  $stateProvider
    .state('appstore.ansible', {
      url: 'applications/:category/',
      template: '<ansible-job-create></ansible-job-create>',
      data: {
        category: APPSTORE_CATEGORY,
        pageTitle: gettext('Applications'),
        sidebarState: 'project.resources',
        feature: 'ansible'
      },
      resolve: {
        // @ngInject
        application: function (AnsiblePlaybooksService, $stateParams, $state) {
          return AnsiblePlaybooksService.get($stateParams.category).catch(response => {
            if (response.status === 404) {
              $state.go('errorPage.notFound');
            }
          });
        }
      }
    })

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
