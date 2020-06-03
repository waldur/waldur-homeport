import { gettext } from '@waldur/i18n';
import { AnonymousLayout } from '@waldur/navigation/AnonymousLayout';

export const states = [
  {
    name: 'help',
    url: '/help/',
    abstract: true,
    component: AnonymousLayout,
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
