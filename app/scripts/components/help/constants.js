export const HELP_TYPE_NAMES = {
  providers: 'providers',
  sshKeys: 'ssh_keys',
  alertsList: 'alerts_&_events',
  eventsList: 'alerts_&_events'
};

export const HELP_TITLES = {
  [HELP_TYPE_NAMES.providers]: gettext('Providers'),
  [HELP_TYPE_NAMES.sshKeys]: gettext('How to generate SSH key'),
  [HELP_TYPE_NAMES.alertsList]: gettext('Alerts & events')
};

export const HELP_KEYS = {
  alerts: 'alerts',
  events: 'events',
  sshKeys: 'keys',
  azure: 'Azure',
  digitalocean: 'DigitalOcean',
  amazon: 'Amazon'
};
