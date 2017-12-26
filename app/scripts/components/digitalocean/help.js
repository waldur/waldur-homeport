import content from './help.html';
import {HELP_TYPE_NAMES, HELP_KEYS} from '@waldur/help/constants';
import HelpRegistry from '@waldur/help/help-registry';

const helpData = {
  type: HELP_TYPE_NAMES.providers,
  key: HELP_KEYS.digitalocean,
  name: gettext('DigitalOcean provider'),
  title: gettext('How to obtain credentials for DigitalOcean provider'),
  link: 'https://www.digitalocean.com/community/tutorials/how-to-use-the-digitalocean-api-v2',
  content: content,
  template: '<help-content-two-column model="$ctrl.model"></help-content-two-column>'
};

HelpRegistry.register(helpData.type, helpData);
