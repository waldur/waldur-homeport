import issueCreate from './create';
import issueList from './list';

// @ngInject
function configureIssues($stateProvider) {
  $stateProvider
    .state('support', {
      url: '/support/',
      template: '<customer-workspace><ui-view/></customer-workspace>',
      abstract: true,
      data: {
        auth: true
      }
    })

    .state('support.list', {
      url: '',
      template: '<issue-list></issue-list>',
      data: {
        pageTitle: 'List issues'
      }
    })

    .state('support.create', {
      url: 'add/:type',
      template: '<issue-create></issue-create>',
      data: {
        pageTitle: 'Create issue'
      }
    });
}

export default module => {
  module.directive('issueList', issueList);
  module.directive('issueCreate', issueCreate);
  module.config(configureIssues);
}
