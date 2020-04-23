import { AnonymousLayout } from '@waldur/navigation/AnonymousLayout';
import { withStore } from '@waldur/store/connect';

function resolveCurrentUser(usersService) {
  return usersService.getCurrentUser();
}
resolveCurrentUser.$inject = ['usersService'];

export const states = [
  {
    name: 'home',
    url: '',
    abstract: true,
    component: withStore(AnonymousLayout),
  },

  {
    name: 'login',
    url: '/login/',
    template: '<auth-login mode="\'login\'"></auth-login>',
    params: {
      toState: '',
      toParams: {},
    },
    data: {
      bodyClass: 'old',
      anonymous: true,
    },
  },

  {
    name: 'register',
    url: '/register/',
    template: '<auth-login mode="\'register\'"></auth-login>',
    data: {
      bodyClass: 'old',
      anonymous: true,
    },
  },

  {
    name: 'home.activate',
    url: '/activate/:user_uuid/:token/',
    template: '<auth-activation></auth-activation>',
    data: {
      anonymous: true,
      bodyClass: 'old',
    },
  },

  {
    name: 'initialdata',
    parent: 'home',
    url: '/initial-data/',
    template: '<ui-view></ui-view>',
    abstract: true,
  },

  {
    name: 'initialdata.view',
    url: '',
    template: '<auth-init></auth-init>',
    noInitialData: true,
    data: {
      auth: true,
      bodyClass: 'old',
    },
    resolve: {
      currentUser: resolveCurrentUser,
    },
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
