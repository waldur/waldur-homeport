import content from './help.html';
import {HELP_TYPE_NAMES, HELP_KEYS} from '@waldur/help/constants';
import HelpRegistry from '@waldur/help/help-registry';

const helpData = {
  type: HELP_TYPE_NAMES.providers,
  key: HELP_KEYS.azure,
  name: gettext('Azure provider'),
  title: gettext('How to obtain credentials for Azure provider'),
  link: null,
  content: content,
  template: '<help-content-two-column model="$ctrl.model"></help-content-two-column>'
};

HelpRegistry.register(helpData.type, helpData);
