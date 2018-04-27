import eventsRegistry from '@waldur/events/registry';
import { getCustomerContext, getProjectContext, getLink } from '@waldur/events/utils';
import { gettext } from '@waldur/i18n';

const getExpertRequestLink = event => {
  const ctx = {requestId: event.expert_request_uuid};
  return getLink('project.expertRequestDetails', ctx, event.expert_request_name);
};

const getExpertRequestContext = event => {
  return {
    request: getExpertRequestLink(event),
    ...getCustomerContext(event),
    ...getProjectContext(event),
  };
};

eventsRegistry.registerGroup({
  title: gettext('Expert request events'),
  context: getExpertRequestContext,
  events: [
    {
      key: 'expert_request_created',
      title: gettext('User {caller_link} has created request for experts under {customer_link} / {project_link}.'),
    },
    {
      key: 'expert_request_activated',
      title: gettext('Expert request "{request_link}" has been activated.'),
    },
    {
      key: 'expert_request_cancelled',
      title: gettext('Expert request "{request_link}" has been cancelled.'),
    },
    {
      key: 'expert_request_completed',
      title: gettext('Expert request "{request_link}" has been completed.'),
    },
  ],
});
