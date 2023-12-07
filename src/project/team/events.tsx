import { UISref } from '@uirouter/react';

import eventsRegistry from '@waldur/events/registry';
import {
  getUserContext,
  getAffectedUserContext,
  RoleEvent,
} from '@waldur/events/utils';
import { translate, gettext, formatJsxTemplate } from '@waldur/i18n';
import { formatRole } from '@waldur/permissions/utils';

import { CustomersEnum } from '../../EventsEnums';

const getScopeLink = (event: RoleEvent) => ({
  scope_link: (
    <UISref
      to={
        event.structure_type === 'customer'
          ? 'organization.events'
          : 'project.dashboard'
      }
      params={{
        uuid:
          event.structure_type === 'customer'
            ? event.customer_uuid
            : event.project_uuid,
      }}
    >
      <a>
        {event.structure_type === 'customer'
          ? event.customer_name
          : event.project_name}
      </a>
    </UISref>
  ),
});

const getEventContext = (event: RoleEvent) => ({
  ...getUserContext(event),
  ...getAffectedUserContext(event),
  ...getScopeLink(event),
  role_name: formatRole(event.role_name) || 'N/A',
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

eventsRegistry.registerGroup({
  title: gettext('Role management events'),
  events: [
    {
      key: CustomersEnum.role_granted,
      title: gettext(
        'User {user_link} has granted role to {affected_user_link}.',
      ),
      formatter: formatRoleGrantedEvent,
    },
    {
      key: CustomersEnum.role_revoked,
      title: gettext('User {user_link} has revoked {affected_user_link}.'),
      formatter: formatRoleRevokedEvent,
    },
  ],
});
