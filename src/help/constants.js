import { gettext } from '@waldur/i18n';

export const HELP_CATEGORIES = {
  providers: 'providers',
  keys: 'keys',
  logging: 'logging',
};

export const HELP_TITLES = {
  [HELP_CATEGORIES.providers]: gettext('Providers'),
  [HELP_CATEGORIES.sshKeys]: gettext('How to generate SSH key'),
  [HELP_CATEGORIES.logging]: gettext('Events')
};
