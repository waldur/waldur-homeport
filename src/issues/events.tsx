import { Link } from '@/core/Link';
import { EventGroup } from '@/events/types';
import { getCallerContext } from '@/events/utils';
import { translate } from '@/i18n';

import { SupportEnum } from '../EventsEnums';

const getIssueContext = (event) => ({
  ...getCallerContext(event),
  issue_link: (
    <Link state="support.detail" params={{ issue_uuid: event.issue_uuid }}>
      {event.issue_key}
    </Link>
  ),
});

export const IssueEvents: EventGroup = {
  title: translate('Support request events'),
  context: getIssueContext,
  events: [
    {
      key: SupportEnum.issue_creation_succeeded,
      title: translate('Issue {issue_link} has been created by {caller_link}.'),
    },
  ],
};
