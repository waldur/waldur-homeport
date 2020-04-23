import { gettext } from '@waldur/i18n';
import { AnonymousLayout } from '@waldur/navigation/AnonymousLayout';
import { withStore } from '@waldur/store/connect';

export const states = [
  {
    name: 'help',
    url: '/help/',
    abstract: true,
    component: withStore(AnonymousLayout),
    data: {
      pageTitle: gettext('Help'),
      bodyClass: 'old',
      auth: true,
      feature: 'help',
    },
  },

  { name: 'help.list', url: '', template: '<help-list></help-list>' },

  {
    name: 'help.details',
    url: ':type/:name/',
    template: '<help-details></help-details>',
  },
];

export default function registerRoutes($stateProvider) {
  states.forEach(({ name, ...rest }) => $stateProvider.state(name, rest));
}
registerRoutes.$inject = ['$stateProvider'];
