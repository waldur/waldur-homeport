export const states = [
  {
    name: 'offeringDetails',
    url: '/offering/:uuid/',
    template: '<offering-details></offering-details>',
    feature: 'offering',
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
