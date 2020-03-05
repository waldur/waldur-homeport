import content from './help.html';
import { HELP_CATEGORIES } from '@waldur/help/constants';
import HelpRegistry from '@waldur/help/help-registry';

const helpData = {
  type: HELP_CATEGORIES.keys,
  key: 'ssh',
  name: gettext('Keys'),
  title: gettext('How to generate SSH key'),
  content: content,
  template:
    '<help-content-one-column model="$ctrl.model"></help-content-one-column>',
};

HelpRegistry.register(helpData.type, helpData);
