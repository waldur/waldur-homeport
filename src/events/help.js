import {HELP_CATEGORIES} from '@waldur/help/constants';
import HelpRegistry from '@waldur/help/help-registry';

const helpData = {
  type: HELP_CATEGORIES.logging,
  key: 'events',
  name: gettext('Events'),
  title: gettext('Events'),
  content: '<event-groups></event-groups>',
  template: '<help-content-one-column model="$ctrl.model"></help-content-one-column>'
};

HelpRegistry.register(helpData.type, helpData);
