export const states = [
  {
    name: 'invitation',
    url: '/invitation/:uuid/',
    data: {
      bodyClass: 'old',
    },
    template: '<invitation-accept></invitation-accept>',
  },

  {
    name: 'invitation-approve',
    url: '/invitation_approve/:token/',
    template: '<invitation-approve></invitation-approve>',
    data: {
      bodyClass: 'old',
    },
  },

  {
    name: 'invitation-reject',
    url: '/invitation_reject/:token/',
    template: '<invitation-reject></invitation-reject>',
    data: {
      bodyClass: 'old',
    },
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
