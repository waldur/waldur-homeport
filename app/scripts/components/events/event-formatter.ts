import { $state } from '@waldur/core/services';
import * as eventsRegistry from '@waldur/events/registry';

export const getLink = (route, params, label) =>
  `<a href="${$state.href(route, params)}">${label}</a>`;

const getUserLink = event => {
  const name = event.user_fullname || event.user_username;
  const ctx = {uuid: event.user_uuid};
  return getLink('users.details', ctx, name);
};

const getAffectedUserLink = event => {
  const name = event.affected_user_fullname || event.affected_user_username;
  const ctx = {uuid: event.affected_user_uuid};
  return getLink('users.details', ctx, name);
};

const getCustomerLink = event => {
  const ctx = {uuid: event.customer_uuid};
  return getLink('organization.details', ctx, event.customer_name);
};

const getProjectLink = event => {
  const ctx = {uuid: event.project_uuid};
  return getLink('project.details', ctx, event.project_name);
};

export const getUserContext = event => ({
  user: getUserLink(event),
});

export const getAffectedUserContext = event => ({
  affectedUser: getAffectedUserLink(event),
});

export const getCustomerContext = event => ({
  customer: getCustomerLink(event),
});

export const getProjectContext = event => ({
  project: getProjectLink(event),
});

export const eventFormatter = event => {
  const formatter = eventsRegistry.get(event.event_type);
  if (formatter) {
    return formatter(event);
  }
  return event.message;
};
