import { UISref } from '@uirouter/react';

import { UserDetailsLink } from './UserDetailsLink';

interface UserContext {
  user_uuid: string;
  user_full_name: string;
  user_username: string;
}

interface AffectedUserContext {
  affected_user_uuid: string;
  affected_user_full_name: string;
  affected_user_username: string;
}

export interface RoleEvent extends UserContext, AffectedUserContext {
  customer_uuid: any;
  customer_name: string;
  project_uuid: any;
  project_name: string;
  scope_uuid: string;
  scope_name: string;
  role_name: string;
  structure_type: string;
}

interface CustomerContext {
  customer_uuid: string;
  customer_name: string;
}

interface ProjectContext {
  project_uuid: string;
  project_name: string;
}

export const getUserContext = (event: UserContext) => ({
  user_link: (
    <UserDetailsLink
      uuid={event.user_uuid}
      name={event.user_full_name || event.user_username}
    />
  ),
});

export const getAffectedUserContext = (event: AffectedUserContext) => ({
  affected_user_link: (
    <UserDetailsLink
      uuid={event.affected_user_uuid}
      name={event.affected_user_full_name || event.affected_user_username}
    />
  ),
});

export const getCustomerContext = (event: CustomerContext) => ({
  customer_link: (
    <UISref to="organization.events" params={{ uuid: event.customer_uuid }}>
      <a>{event.customer_name}</a>
    </UISref>
  ),
});

export const getProjectContext = (event: ProjectContext) => ({
  project_link: (
    <UISref to="project.dashboard" params={{ uuid: event.project_uuid }}>
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
