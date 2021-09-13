import { UISref } from '@uirouter/react';

import { UserDetailsLink } from './UserDetailsLink';

export const getUserContext = (event) => ({
  user_link: (
    <UserDetailsLink
      uuid={event.user_uuid}
      name={event.user_full_name || event.user_username}
    />
  ),
});

export const getAffectedUserContext = (event) => ({
  affected_user_link: (
    <UserDetailsLink
      uuid={event.affected_user_uuid}
      name={event.affected_user_full_name || event.affected_user_username}
    />
  ),
});

export const getCustomerContext = (event) => ({
  customer_link: (
    <UISref to="organization.details" params={{ uuid: event.customer_uuid }}>
      <a>{event.customer_name}</a>
    </UISref>
  ),
});

export const getProjectContext = (event) => ({
  project_link: (
    <UISref to="project.details" params={{ uuid: event.project_uuid }}>
      <a>{event.project_name}</a>
    </UISref>
  ),
});

export const getCallerContext = (event) => ({
  caller_link: (
    <UserDetailsLink
      uuid={event.caller_uuid}
      name={event.caller_full_name || event.caller_username}
    />
  ),
});
