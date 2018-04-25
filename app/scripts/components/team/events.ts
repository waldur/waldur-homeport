import {
  getUserContext,
  getAffectedUserContext,
  getCustomerContext,
  getProjectContext
} from '@waldur/events/event-formatter';
import * as eventsRegistry from '@waldur/events/registry';
import { translate } from '@waldur/i18n';

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

eventsRegistry.register({
  role_granted: event => {
    if (event.structure_type === 'customer') {
      const context = getCustomerRoleContext(event);
      if (event.role_name === 'Owner') {
        return translate('User {user} has granted organization owner role in {customer} to {affectedUser}.', context);
      } else if (event.role_name === 'Support') {
        return translate('User {user} has granted organization support role in {customer} to {affectedUser}.', context);
      }
    } else if (event.structure_type === 'project') {
      const context = getProjectRoleContext(event);
      if (event.role_name === 'Administrator') {
        return translate('User {user} has granted project administrator role in project {project} to {affectedUser}.', context);
      } else if (event.role_name === 'Manager') {
        return translate('User {user} has granted project manager role in project {project} to {affectedUser}.', context);
      }
    }
  },

  role_revoked: event => {
    if (event.structure_type === 'customer') {
      const context = getCustomerRoleContext(event);
      if (event.role_name === 'Owner') {
        return translate('User {user} has revoked organization owner {affectedUser} from {customer}.', context);
      } else if (event.role_name === 'Support') {
        return translate('User {user} has revoked organization support {affectedUser} from {customer}.', context);
      }
    } else if (event.structure_type === 'project') {
      const context = getProjectRoleContext(event);
      if (event.role_name === 'Administrator') {
        return translate('User {user} has revoked project administrator {affectedUser} from project {project}.', context);
      } else if (event.role_name === 'Manager') {
        return translate('User {user} has revoked project manager {affectedUser} from project {project}.', context);
      }
    }
  },
});
