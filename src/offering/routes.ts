import { StateDeclaration } from '@waldur/core/types';

export const states: StateDeclaration[] = [
  {
    name: 'offeringDetails',
    url: '/offering/:uuid/',
    template: '<offering-details></offering-details>',
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
