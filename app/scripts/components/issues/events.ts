import { getLink } from '@waldur/events/event-formatter';
import * as eventsRegistry from '@waldur/events/registry';
import { gettext } from '@waldur/i18n';

const getCallerLink = event => {
  const name = event.caller_fullname || event.caller_username;
  const ctx = {uuid: event.caller_uuid};
  return getLink('users.details', ctx, name);
};

const getIssueContext = event => {
  return {
    issue: getLink('support.detail', {uuid: event.uuid}, event.issue_key),
    caller: getCallerLink(event),
  };
};

eventsRegistry.register({
  title: gettext('Support request events'),
  context: getIssueContext,
  events: [
    {
      key: 'issue_creation_succeeded',
      title: gettext('Issue {issue} has been created by {caller}.'),
    },
  ],
});
