import { $state } from '@waldur/core/services';

export const getLink = (route, params, label) =>
  `<a href="${$state.href(route, params)}">${label}</a>`;

const getUserLink = event => {
  const name = event.user_full_name || event.user_username;
  const ctx = {uuid: event.user_uuid};
  return getLink('users.details', ctx, name);
};

const getAffectedUserLink = event => {
  const name = event.affected_user_full_name || event.affected_user_username;
  const ctx = {uuid: event.affected_user_uuid};
  return getLink('users.details', ctx, name);
};

const getCallerLink = event => {
  const name = event.caller_full_name || event.caller_username;
  const ctx = {uuid: event.caller_uuid};
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
  user_link: getUserLink(event),
});

export const getAffectedUserContext = event => ({
  affected_user_link: getAffectedUserLink(event),
});

export const getCustomerContext = event => ({
  customer_link: getCustomerLink(event),
});

export const getProjectContext = event => ({
  project_link: getProjectLink(event),
});

export const getCallerContext = event => ({
  caller_link: getCallerLink(event),
});
