import { StateDeclaration } from '@waldur/core/types';

import { ChecklistOverview } from './ChecklistOverview';
import { FEATURE } from './constants';
import { UserChecklist } from './UserChecklist';

export const states: StateDeclaration[] = [
  {
    name: 'marketplace-checklist-user',
    url: 'marketplace-checklist-user/:category/',
    component: UserChecklist,
    parent: 'profile',
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
