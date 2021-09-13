import { UISref } from '@uirouter/react';

import eventsRegistry from '@waldur/events/registry';
import { getCallerContext } from '@waldur/events/utils';
import { gettext } from '@waldur/i18n';

const getIssueContext = (event) => ({
  ...getCallerContext(event),
  issue_link: (
    <UISref to="support.detail" params={{ uuid: event.issue_uuid }}>
      <a>{event.issue_key}</a>
    </UISref>
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
