import { getCustomerContext, getProjectContext, getLink } from '@waldur/events/event-formatter';
import * as eventsRegistry from '@waldur/events/registry';
import { translate } from '@waldur/i18n';

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

eventsRegistry.register({
  expert_request_created: event =>
    translate('User {caller} has created request for experts under {customer} / {project}.', event),

  expert_request_activated: event =>
    translate('Expert request "{request}" has been activated.', getExpertRequestContext(event)),

  expert_request_cancelled: event =>
    translate('Expert request "{request}" has been cancelled.', getExpertRequestContext(event)),

  expert_request_completed: event =>
    translate('Expert request "{request}" has been completed.', getExpertRequestContext(event)),
});
