import { StateDeclaration } from '@waldur/core/types';
import { gettext } from '@waldur/i18n';

import { ChecklistOverview } from './ChecklistOverview';
import { FEATURE } from './constants';
import { ProjectChecklist } from './ProjectChecklist';

export const states: StateDeclaration[] = [
  {
    name: 'marketplace-checklist-project',
    url: 'marketplace-checklist-project/:category/',
    component: ProjectChecklist,
    parent: 'project',
    data: {
      pageTitle: gettext('Compliance'),
      feature: FEATURE,
    },
  },

  {
    name: 'marketplace-checklist-overview',
    url: 'marketplace-checklist-overview/:category/',
    component: ChecklistOverview,
    parent: 'support',
    data: {
      pageTitle: gettext('Compliance'),
      feature: FEATURE,
    },
  },
];
