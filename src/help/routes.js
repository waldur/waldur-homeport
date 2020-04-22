import { AnonymousLayout } from '@waldur/navigation/AnonymousLayout';
import { withStore } from '@waldur/store/connect';

// @ngInject
export default function helpRoutes($stateProvider) {
  $stateProvider
    .state('help', {
      url: '/help/',
      abstract: true,
      component: withStore(AnonymousLayout),
      data: {
        pageTitle: gettext('Help'),
        bodyClass: 'old',
        auth: true,
        feature: 'help',
      },
    })

    .state('help.list', {
      url: '',
      template: '<help-list></help-list>',
    })

    .state('help.details', {
      url: ':type/:name/',
      template: '<help-details></help-details>',
    });
}
