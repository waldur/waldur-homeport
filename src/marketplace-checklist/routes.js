import { withStore } from '@waldur/store/connect';

import { ChecklistOverview } from './ChecklistOverview';
import { FEATURE } from './constants';
import { ProjectChecklist } from './ProjectChecklist';

// @ngInject
export default function routes($stateProvider) {
  $stateProvider
    .state('marketplace-checklist-project', {
      url: 'marketplace-checklist-project/:category/',
      component: withStore(ProjectChecklist),
      parent: 'project',
      data: {
        pageTitle: gettext('Compliance'),
        feature: FEATURE,
      },
    })

    .state('marketplace-checklist-overview', {
      url: 'marketplace-checklist-overview/:category/',
      component: withStore(ChecklistOverview),
      parent: 'support',
      data: {
        pageTitle: gettext('Compliance'),
        feature: FEATURE,
      },
    });
}
