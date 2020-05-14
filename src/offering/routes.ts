import { StateDeclaration } from '@waldur/core/types';
import { withStore } from '@waldur/store/connect';

import { OfferingDetailsContainer } from './OfferingDetailsContainer';

export const states: StateDeclaration[] = [
  {
    name: 'offeringDetails',
    url: '/offering/:uuid/',
    component: withStore(OfferingDetailsContainer),
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
