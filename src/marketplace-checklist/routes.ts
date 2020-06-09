import { StateDeclaration } from '@waldur/core/types';

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
      feature: FEATURE,
    },
  },

  {
    name: 'marketplace-checklist-overview',
    url: 'marketplace-checklist-overview/:category/',
    component: ChecklistOverview,
    parent: 'support',
    data: {
      feature: FEATURE,
    },
  },
];
