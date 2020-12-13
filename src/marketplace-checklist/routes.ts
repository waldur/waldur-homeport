import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const ChecklistCustomer = lazyComponent(
  () =>
    import(/* webpackChunkName: "ChecklistCustomer" */ './ChecklistCustomer'),
  'ChecklistCustomer',
);
const ChecklistOverview = lazyComponent(
  () =>
    import(/* webpackChunkName: "ChecklistOverview" */ './ChecklistOverview'),
  'ChecklistOverview',
);
const UserChecklist = lazyComponent(
  () => import(/* webpackChunkName: "UserChecklist" */ './UserChecklist'),
  'UserChecklist',
);

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
