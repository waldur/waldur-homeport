import { FC } from 'react';

import { getPermissionLabel } from '@/administration/roles/permissionDiff';
import { Link } from '@/core/Link';
import { EventGroup } from '@/events/types';
import {
  AffectedUserContext,
  getAffectedUserContext,
  getCustomerContext,
  getUserContext,
  UserContext,
} from '@/events/utils';
import { formatJsxTemplate, translate } from '@/i18n';
import { RolePopover } from '@/user/affiliations/RolePopover';

import { PermissionsEnum } from '../EventsEnums';

import { RoleType } from './types';
import { formatRoleType } from './utils';

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

/** Events about what a role *means*, as opposed to who holds it. */
interface RoleDefinitionEvent extends UserContext {
  role_name: string;
  role_uuid: string;
  customer_uuid?: string;
  customer_name?: string;
  template_name?: string;
}

const getDefinitionContext = (event: RoleDefinitionEvent) => ({
  ...getUserContext(event),
  role_name: <RolePopover roleName={event.role_name} />,
  template_name: event.template_name ? (
    <RolePopover roleName={event.template_name} />
  ) : (
    'N/A'
  ),
  // Only the clone and concealment events name an organization, and those
  // always carry one. A deployment-wide role is bound to none, so there is
  // nothing to link to and no message that asks for it.
  ...(event.customer_uuid
    ? getCustomerContext({
        customer_uuid: event.customer_uuid,
        customer_name: event.customer_name,
      })
    : { customer_link: event.customer_name }),
});

const formatRoleDefinitionCreatedEvent = (event: RoleDefinitionEvent) => {
  const context = getDefinitionContext(event);
  if (event.user_uuid) {
    return translate(
      'User {user_link} has created role {role_name}.',
      context,
      formatJsxTemplate,
    );
  }
  return translate(
    'Role {role_name} has been created.',
    context,
    formatJsxTemplate,
  );
};

const formatRoleDefinitionUpdatedEvent = (event: RoleDefinitionEvent) => {
  const context = getDefinitionContext(event);
  if (event.user_uuid) {
    return translate(
      'User {user_link} has changed the definition of role {role_name}.',
      context,
      formatJsxTemplate,
    );
  }
  return translate(
    'The definition of role {role_name} has been changed.',
    context,
    formatJsxTemplate,
  );
};

const formatRoleDefinitionDeletedEvent = (event: RoleDefinitionEvent) => {
  const context = getDefinitionContext(event);
  if (event.user_uuid) {
    return translate(
      'User {user_link} has deleted role {role_name}.',
      context,
      formatJsxTemplate,
    );
  }
  return translate(
    'Role {role_name} has been deleted.',
    context,
    formatJsxTemplate,
  );
};

const formatRoleEnabledEvent = (event: RoleDefinitionEvent) => {
  const context = getDefinitionContext(event);
  if (event.user_uuid) {
    return translate(
      'User {user_link} has enabled role {role_name}.',
      context,
      formatJsxTemplate,
    );
  }
  return translate(
    'Role {role_name} has been enabled.',
    context,
    formatJsxTemplate,
  );
};

const formatRoleDisabledEvent = (event: RoleDefinitionEvent) => {
  const context = getDefinitionContext(event);
  if (event.user_uuid) {
    return translate(
      'User {user_link} has disabled role {role_name}.',
      context,
      formatJsxTemplate,
    );
  }
  return translate(
    'Role {role_name} has been disabled.',
    context,
    formatJsxTemplate,
  );
};

const formatRoleClonedEvent = (event: RoleDefinitionEvent) => {
  const context = getDefinitionContext(event);
  if (event.user_uuid) {
    return translate(
      'User {user_link} has cloned role {template_name} into {customer_link} as {role_name}.',
      context,
      formatJsxTemplate,
    );
  }
  return translate(
    'Role {template_name} has been cloned into {customer_link} as {role_name}.',
    context,
    formatJsxTemplate,
  );
};

const formatRoleConcealedEvent = (event: RoleDefinitionEvent) => {
  const context = getDefinitionContext(event);
  if (event.user_uuid) {
    return translate(
      'User {user_link} has concealed role {role_name} for {customer_link}.',
      context,
      formatJsxTemplate,
    );
  }
  return translate(
    'Role {role_name} has been concealed for {customer_link}.',
    context,
    formatJsxTemplate,
  );
};

const formatRoleRevealedEvent = (event: RoleDefinitionEvent) => {
  const context = getDefinitionContext(event);
  if (event.user_uuid) {
    return translate(
      'User {user_link} has revealed role {role_name} for {customer_link}.',
      context,
      formatJsxTemplate,
    );
  }
  return translate(
    'Role {role_name} has been revealed for {customer_link}.',
    context,
    formatJsxTemplate,
  );
};

export interface RoleDefinitionChangeContext {
  added_permissions?: string[];
  removed_permissions?: string[];
  permissions?: string[];
  old_name?: string;
  role_name?: string;
  old_content_type?: string;
  new_content_type?: string;
  old_descriptions?: Record<string, string>;
  new_descriptions?: Record<string, string>;
}

interface DescriptionChange {
  label: string;
  from?: string;
  to?: string;
}

interface RoleDefinitionDetails {
  added: string[];
  removed: string[];
  permissions: string[];
  renamedFrom?: string;
  renamedTo?: string;
  scopeFrom?: string;
  scopeTo?: string;
  descriptions: DescriptionChange[];
}

const DEFINITION_EVENTS: string[] = [
  PermissionsEnum.role_definition_created,
  PermissionsEnum.role_definition_updated,
  PermissionsEnum.role_definition_deleted,
];

const getDescriptionLabel = (field: string) =>
  field === 'description'
    ? translate('Description')
    : translate('Description ({language})', {
        language: field.replace('description_', ''),
      });

const getDescriptionChanges = (
  before: Record<string, string> = {},
  after: Record<string, string> = {},
): DescriptionChange[] =>
  [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((field) => (before[field] || '') !== (after[field] || ''))
    .sort()
    .map((field) => ({
      label: getDescriptionLabel(field),
      from: before[field],
      to: after[field],
    }));

/**
 * What a role definition event says the role gained, lost or had.
 *
 * Returns null when there is nothing to show, and the details row is gated on
 * the same call that renders it: deriving both from one function is what keeps
 * the label from appearing above an empty column.
 */
export const getRoleDefinitionDetails = (
  eventType: string,
  context: RoleDefinitionChangeContext,
): RoleDefinitionDetails | null => {
  if (!DEFINITION_EVENTS.includes(eventType)) {
    return null;
  }
  const details: RoleDefinitionDetails = {
    added: context.added_permissions || [],
    removed: context.removed_permissions || [],
    permissions: context.permissions || [],
    descriptions: getDescriptionChanges(
      context.old_descriptions,
      context.new_descriptions,
    ),
  };
  if (context.old_name && context.old_name !== context.role_name) {
    details.renamedFrom = context.old_name;
    details.renamedTo = context.role_name;
  }
  if (
    context.old_content_type &&
    context.old_content_type !== context.new_content_type
  ) {
    details.scopeFrom = context.old_content_type;
    details.scopeTo = context.new_content_type;
  }
  const empty =
    !details.added.length &&
    !details.removed.length &&
    !details.permissions.length &&
    !details.descriptions.length &&
    !details.renamedFrom &&
    !details.scopeFrom;
  return empty ? null : details;
};

const PermissionList: FC<{ codes: string[]; sign?: string }> = ({
  codes,
  sign,
}) => (
  <ul className="mb-0">
    {codes.map((code) => (
      <li key={code}>
        {sign ? `${sign} ` : null}
        {getPermissionLabel(code)}
      </li>
    ))}
  </ul>
);

const DescriptionChangeLine: FC<{ change: DescriptionChange }> = ({
  change,
}) => {
  const { label, from, to } = change;
  if (!from) {
    return <>{translate('{label} set to "{to}".', { label, to })}</>;
  }
  if (!to) {
    return <>{translate('{label} cleared (was "{from}").', { label, from })}</>;
  }
  return <>{translate('{label}: "{from}" to "{to}".', { label, from, to })}</>;
};

/**
 * What a role definition change actually changed.
 *
 * The backend puts the delta in the event context, but the event message only
 * says that the role changed. Without this an auditor sees that a role held by
 * dozens of users was edited and has no way to see what it gained or lost,
 * although the data is already in the row.
 */
export const RoleDefinitionChanges: FC<{
  eventType: string;
  context: RoleDefinitionChangeContext;
}> = ({ eventType, context }) => {
  const details = getRoleDefinitionDetails(eventType, context);
  if (!details) {
    return null;
  }
  const {
    added,
    removed,
    permissions,
    renamedFrom,
    renamedTo,
    scopeFrom,
    scopeTo,
    descriptions,
  } = details;
  return (
    <div className="mt-3">
      {added.length > 0 && (
        <div className="mb-3">
          <strong className="text-success">
            {translate('Added permissions ({count})', { count: added.length })}
          </strong>
          <PermissionList codes={added} sign="+" />
        </div>
      )}
      {removed.length > 0 && (
        <div className="mb-3">
          <strong className="text-danger">
            {translate('Removed permissions ({count})', {
              count: removed.length,
            })}
          </strong>
          <PermissionList codes={removed} sign="-" />
        </div>
      )}
      {permissions.length > 0 && (
        <div className="mb-3">
          <strong>
            {translate('Permissions ({count})', { count: permissions.length })}
          </strong>
          <PermissionList codes={permissions} />
        </div>
      )}
      {descriptions.map((change) => (
        <div className="mb-3" key={change.label}>
          <DescriptionChangeLine change={change} />
        </div>
      ))}
      {renamedFrom && (
        <div className="mb-3">
          {translate('Renamed from {old_name} to {role_name}.', {
            old_name: renamedFrom,
            role_name: renamedTo,
          })}
        </div>
      )}
      {scopeFrom && (
        <div className="mb-0">
          {translate('Scope changed from {old_scope} to {new_scope}.', {
            old_scope: formatRoleType(scopeFrom as RoleType),
            new_scope: formatRoleType(scopeTo as RoleType),
          })}
        </div>
      )}
    </div>
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
    {
      key: PermissionsEnum.role_definition_created,
      title: translate('User {user_link} has created a role.'),
      formatter: formatRoleDefinitionCreatedEvent,
    },
    {
      key: PermissionsEnum.role_definition_updated,
      title: translate('User {user_link} has changed a role definition.'),
      formatter: formatRoleDefinitionUpdatedEvent,
    },
    {
      key: PermissionsEnum.role_definition_deleted,
      title: translate('User {user_link} has deleted a role.'),
      formatter: formatRoleDefinitionDeletedEvent,
    },
    {
      key: PermissionsEnum.role_enabled,
      title: translate('User {user_link} has enabled a role.'),
      formatter: formatRoleEnabledEvent,
    },
    {
      key: PermissionsEnum.role_disabled,
      title: translate('User {user_link} has disabled a role.'),
      formatter: formatRoleDisabledEvent,
    },
    {
      key: PermissionsEnum.role_cloned,
      title: translate(
        'User {user_link} has cloned a role into an organization.',
      ),
      formatter: formatRoleClonedEvent,
    },
    {
      key: PermissionsEnum.role_concealed,
      title: translate(
        'User {user_link} has concealed a role for an organization.',
      ),
      formatter: formatRoleConcealedEvent,
    },
    {
      key: PermissionsEnum.role_revealed,
      title: translate(
        'User {user_link} has revealed a role for an organization.',
      ),
      formatter: formatRoleRevealedEvent,
    },
  ],
};
