import eventsRegistry from '@waldur/events/registry';
import {
  getUserContext,
  getAffectedUserContext,
  getCustomerContext,
  getProjectContext
} from '@waldur/events/utils';
import { translate, gettext } from '@waldur/i18n';

const getRoleContext = event => ({
  ...getUserContext(event),
  ...getAffectedUserContext(event),
});

const getCustomerRoleContext = event => ({
  ...getRoleContext(event),
  ...getCustomerContext(event),
});

const getProjectRoleContext = event => ({
  ...getRoleContext(event),
  ...getProjectContext(event),
});

const formatRoleGrantedEvent = event => {
  if (event.structure_type === 'customer') {
    const context = getCustomerRoleContext(event);
    if (event.role_name === 'Owner') {
      return translate('User {user_link} has granted organization owner role in {customer_link} to {affected_user_link}.', context);
    } else if (event.role_name === 'Support') {
      return translate('User {user_link} has granted organization support role in {customer_link} to {affected_user_link}.', context);
    }
  } else if (event.structure_type === 'project') {
    const context = getProjectRoleContext(event);
    if (event.role_name === 'Administrator') {
      return translate('User {user_link} has granted project administrator role in project {project_link} to {affected_user_link}.', context);
    } else if (event.role_name === 'Manager') {
      return translate('User {user_link} has granted project manager role in project {project_link} to {affected_user_link}.', context);
    }
  }
};

const formatRoleRevokedEvent = event => {
  if (event.structure_type === 'customer') {
    const context = getCustomerRoleContext(event);
    if (event.role_name === 'Owner') {
      return translate('User {user_link} has revoked organization owner {affected_user_link} from {customer_link}.', context);
    } else if (event.role_name === 'Support') {
      return translate('User {user_link} has revoked organization support {affected_user_link} from {customer_link}.', context);
    }
  } else if (event.structure_type === 'project') {
    const context = getProjectRoleContext(event);
    if (event.role_name === 'Administrator') {
      return translate('User {user_link} has revoked project administrator {affected_user_link} from project {project_link}.', context);
    } else if (event.role_name === 'Manager') {
      return translate('User {user_link} has revoked project manager {affected_user_link} from project {project_link}.', context);
    }
  }
};

eventsRegistry.registerGroup({
  title: gettext('Role management events'),
  events: [
    {
      key: 'role_granted',
      title: gettext('User {user_link} has granted role to {affected_user_link}.'),
      formatter: formatRoleGrantedEvent,
    },
    {
      key: 'role_revoked',
      title: gettext('User {user_link} has revoked {affected_user_link}.'),
      formatter: formatRoleRevokedEvent,
    },
  ],
});
