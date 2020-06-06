import { StateDeclaration } from '@waldur/core/types';

import { OfferingDetailsContainer } from './OfferingDetailsContainer';

export const states: StateDeclaration[] = [
  {
    name: 'offeringDetails',
    url: '/offering/:uuid/',
    component: OfferingDetailsContainer,
    data: {
      sidebarKey: 'marketplace-project-resources',
    },
  },
];
