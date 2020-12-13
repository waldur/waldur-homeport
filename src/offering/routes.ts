import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';

const OfferingDetails = lazyComponent(
  () => import(/* webpackChunkName: "OfferingDetails" */ './OfferingDetails'),
  'OfferingDetails',
);

export const states: StateDeclaration[] = [
  {
    name: 'offeringDetails',
    url: '/offering/:uuid/',
    component: OfferingDetails,
    data: {
      sidebarKey: 'marketplace-project-resources',
    },
  },
];
