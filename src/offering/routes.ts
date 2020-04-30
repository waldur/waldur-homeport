import { StateDeclaration } from '@waldur/core/types';
import { withStore } from '@waldur/store/connect';

import { OfferingDetails } from './OfferingDetails';

export const states: StateDeclaration[] = [
  {
    name: 'offeringDetails',
    url: '/offering/:uuid/',
    component: withStore(OfferingDetails),
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
