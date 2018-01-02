import content from './help.html';
import {HELP_CATEGORIES} from '@waldur/help/constants';
import HelpRegistry from '@waldur/help/help-registry';

const helpData = {
  type: HELP_CATEGORIES.providers,
  key: 'Amazon',
  name: gettext('Amazon EC2 provider'),
  title: gettext('How to obtain credentials for Amazon EC2 provider'),
  link: 'http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSGettingStartedGuide/AWSCredentials.html',
  content: content,
  template: '<help-content-two-column model="$ctrl.model"></help-content-two-column>'
};

HelpRegistry.register(helpData.type, helpData);
