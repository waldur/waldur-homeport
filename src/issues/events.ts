import eventsRegistry from '@waldur/events/registry';
import { getLink, getCallerContext } from '@waldur/events/utils';
import { gettext } from '@waldur/i18n';

const getIssueContext = event => ({
  ...getCallerContext(event),
  issue_link: getLink(
    'support.detail',
    { uuid: event.issue_uuid },
    event.issue_key,
  ),
});

eventsRegistry.registerGroup({
  title: gettext('Support request events'),
  context: getIssueContext,
  events: [
    {
      key: 'issue_creation_succeeded',
      title: gettext('Issue {issue_link} has been created by {caller_link}.'),
    },
  ],
});
