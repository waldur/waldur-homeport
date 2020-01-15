import { FEATURE } from './constants';

// @ngInject
export default function routes($stateProvider) {
  $stateProvider
    .state('marketplace-checklist-project', {
      url: 'marketplace-checklist-project/',
      template: '<marketplace-checklist-project></marketplace-checklist-project>',
      parent: 'project',
      data: {
        pageTitle: gettext('Compliance'),
        feature: FEATURE,
      }
    });
}
