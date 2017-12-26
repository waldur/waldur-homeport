import content from './help.html';
import {HELP_TYPE_NAMES, HELP_KEYS} from '@waldur/help/constants';
import HelpRegistry from '@waldur/help/help-registry';

const helpData = {
  type: HELP_TYPE_NAMES.sshKeys,
  key: HELP_KEYS.sshKeys,
  name: gettext('Keys'),
  title: gettext('How to generate SSH key'),
  content: content,
  template: '<help-content-one-column model="$ctrl.model"></help-content-one-column>'
};

HelpRegistry.register(helpData.type, helpData);
