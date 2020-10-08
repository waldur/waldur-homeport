import { StateDeclaration } from '@waldur/core/types';

import { ChecklistCustomer } from './ChecklistCustomer';
import { ChecklistOverview } from './ChecklistOverview';
import { UserChecklist } from './UserChecklist';

export const states: StateDeclaration[] = [
  {
    name: 'marketplace-checklist-user',
    url: 'marketplace-checklist-user/:category/',
    component: UserChecklist,
    parent: 'profile',
  },

  {
    name: 'marketplace-checklist-overview',
    url: 'marketplace-checklist-overview/:category/',
    component: ChecklistOverview,
    parent: 'support',
  },

  {
    name: 'marketplace-checklist-customer',
    url: 'marketplace-checklist-customer/',
    component: ChecklistCustomer,
    parent: 'organization',
  },
];
