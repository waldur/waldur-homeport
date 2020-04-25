import { StateDeclaration } from '@waldur/core/types';
import { gettext } from '@waldur/i18n';
import { withStore } from '@waldur/store/connect';

import { ChecklistOverview } from './ChecklistOverview';
import { FEATURE } from './constants';
import { ProjectChecklist } from './ProjectChecklist';

export const states: StateDeclaration[] = [
  {
    name: 'marketplace-checklist-project',
    url: 'marketplace-checklist-project/:category/',
    component: withStore(ProjectChecklist),
    parent: 'project',
    data: {
      pageTitle: gettext('Compliance'),
      feature: FEATURE,
    },
  },

  {
    name: 'marketplace-checklist-overview',
    url: 'marketplace-checklist-overview/:category/',
    component: withStore(ChecklistOverview),
    parent: 'support',
    data: {
      pageTitle: gettext('Compliance'),
      feature: FEATURE,
    },
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
