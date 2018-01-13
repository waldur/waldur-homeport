import {HELP_CATEGORIES} from '@waldur/help/constants';
import HelpRegistry from '@waldur/help/help-registry';

const helpData = {
  type: HELP_CATEGORIES.logging,
  key: 'alerts',
  name: gettext('Alerts'),
  title: gettext('Alerts'),
  content: '<alert-event-groups></alert-event-groups>',
  template: '<help-content-one-column model="$ctrl.model"></help-content-one-column>'
};

HelpRegistry.register(helpData.type, helpData);
