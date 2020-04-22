import { AnonymousLayout } from '@waldur/navigation/AnonymousLayout';
import { withStore } from '@waldur/store/connect';

import { InvalidObjectPage } from './InvalidObjectPage';
import { InvalidQuotaPage } from './InvalidQuotaPage';
import { InvalidRoutePage } from './InvalidRoutePage';

// @ngInject
export default function errorRoutes($stateProvider) {
  $stateProvider
    .state('errorPage', {
      component: withStore(AnonymousLayout),
      abstract: true,
      data: {
        bodyClass: 'old',
      },
    })

    .state('errorPage.notFound', {
      component: withStore(InvalidObjectPage),
      data: {
        pageTitle: gettext('Page is not found.'),
      },
    })

    .state('errorPage.otherwise', {
      url: '*path',
      component: withStore(InvalidRoutePage),
      data: {
        pageTitle: gettext('Object is not found.'),
      },
    })

    .state('errorPage.limitQuota', {
      component: withStore(InvalidQuotaPage),
      data: {
        pageTitle: gettext('Quota has been reached.'),
      },
    });
}
