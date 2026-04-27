import { Link } from '@/core/Link';
import { EventGroup } from '@/events/types';
import {
  AffectedUserContext,
  getAffectedUserContext,
  getUserContext,
  UserContext,
} from '@/events/utils';
import { formatJsxTemplate, translate } from '@/i18n';
import { RolePopover } from '@/user/affiliations/RolePopover';

import { PermissionsEnum } from '../EventsEnums';

interface RoleEvent extends UserContext, AffectedUserContext {
  scope_uuid: string;
  scope_name: string;
  scope_type: string;
  role_name: string;
}

const STATES_MAP = {
  customer: 'organization.dashboard',
  project: 'project.dashboard',
  offering: 'marketplace-offering-details',
  call: 'protected-call.main',
};

const UUID_MAP = {
  customer: 'uuid',
  project: 'uuid',
  offering: 'offering_uuid',
  call: 'call_uuid',
};

const getScopeLink = (event: RoleEvent) => ({
  scope_link: STATES_MAP[event.scope_type] ? (
    <Link
      state={STATES_MAP[event.scope_type]}
      params={{
        [UUID_MAP[event.scope_type]]: event.scope_uuid,
      }}
    >
      {event.scope_name}
    </Link>
  ) : (
    event.scope_name
  ),
});

const getEventContext = (event: RoleEvent) => ({
  ...getUserContext(event),
  ...getAffectedUserContext(event),
  ...getScopeLink(event),
  role_name: event.role_name ? (
    <RolePopover roleName={event.role_name} />
  ) : (
    'N/A'
  ),
});

const formatRoleGrantedEvent = (event: RoleEvent) => {
  const context = getEventContext(event);
  if (event.user_uuid) {
    return translate(
      'User {user_link} has granted {role_name} role in {scope_link} to {affected_user_link}.',
      context,
      formatJsxTemplate,
    );
  } else {
    return translate(
      'User {affected_user_link} has got {role_name} role in {scope_link}.',
      context,
      formatJsxTemplate,
    );
  }
};

const formatRoleRevokedEvent = (event: RoleEvent) => {
  const context = getEventContext(event);
  if (event.user_uuid) {
    return translate(
      'User {user_link} has revoked {role_name} {affected_user_link} from {scope_link}.',
      context,
      formatJsxTemplate,
    );
  } else {
    return translate(
      'User {affected_user_link} has lost {role_name} role in {scope_link}.',
      context,
      formatJsxTemplate,
    );
  }
};

const formatRoleUpdatedEvent = (event: RoleEvent) => {
  const context = getEventContext(event);
  return translate(
    'User {user_link} role has been updated.',
    context,
    formatJsxTemplate,
  );
};

export const RoleEvents: EventGroup = {
  title: translate('Role management events'),
  events: [
    {
      key: PermissionsEnum.role_granted,
      title: translate(
        'User {user_link} has granted role to {affected_user_link}.',
      ),
      formatter: formatRoleGrantedEvent,
    },
    {
      key: PermissionsEnum.role_updated,
      title: translate('User {user_link} role has been updated.'),
      formatter: formatRoleUpdatedEvent,
    },
    {
      key: PermissionsEnum.role_revoked,
      title: translate('User {user_link} has revoked {affected_user_link}.'),
      formatter: formatRoleRevokedEvent,
    },
  ],
};
