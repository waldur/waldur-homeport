import {HELP_TYPE_NAMES, HELP_KEYS} from '@waldur/help/constants';
import HelpRegistry from '@waldur/help/help-registry';

const helpData = {
  type: HELP_TYPE_NAMES.alertsList,
  key: HELP_KEYS.alerts,
  name: gettext('Alerts'),
  title: gettext('Alerts'),
  content: '<alert-event-groups></alert-event-groups>',
  template: '<help-content-one-column model="$ctrl.model"></help-content-one-column>'
};

HelpRegistry.register(helpData.type, helpData);
