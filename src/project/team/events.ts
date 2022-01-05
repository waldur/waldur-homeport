import eventsRegistry from '@waldur/events/registry';
import {
  getUserContext,
  getAffectedUserContext,
  getCustomerContext,
  getProjectContext,
  CustomerRoleEvent,
  ProjectRoleEvent,
  RoleEvent,
} from '@waldur/events/utils';
import { translate, gettext, formatJsxTemplate } from '@waldur/i18n';

const getRoleContext = (event) => ({
  ...getUserContext(event),
  ...getAffectedUserContext(event),
});

const getCustomerRoleContext = (event: CustomerRoleEvent) => ({
  ...getRoleContext(event),
  ...getCustomerContext(event),
});

const getProjectRoleContext = (event: ProjectRoleEvent) => ({
  ...getRoleContext(event),
  ...getProjectContext(event),
});

const formatRoleGrantedEvent = (event: RoleEvent) => {
  if (event.structure_type === 'customer') {
    const context = getCustomerRoleContext(event);
    if (event.role_name === 'Owner') {
      return translate(
        'User {user_link} has granted organization owner role in {customer_link} to {affected_user_link}.',
        context,
        formatJsxTemplate,
      );
    } else if (event.role_name === 'Support') {
      return translate(
        'User {user_link} has granted organization support role in {customer_link} to {affected_user_link}.',
        context,
        formatJsxTemplate,
      );
    }
  } else if (event.structure_type === 'project') {
    const context = getProjectRoleContext(event);
    if (event.role_name === 'Administrator') {
      if (event.user_uuid) {
        return translate(
          'User {user_link} has granted project administrator role in project {project_link} to {affected_user_link}.',
          context,
          formatJsxTemplate,
        );
      } else {
        return translate(
          'User {affected_user_link} has got project administrator role in project {project_link}.',
          context,
          formatJsxTemplate,
        );
      }
    } else if (event.role_name === 'Manager') {
      if (event.user_uuid) {
        return translate(
          'User {user_link} has granted project manager role in project {project_link} to {affected_user_link}.',
          context,
          formatJsxTemplate,
        );
      } else {
        return translate(
          'User {affected_user_link} has got project manager role in project {project_link}.',
          context,
          formatJsxTemplate,
        );
      }
    } else if (event.role_name === 'Member') {
      if (event.user_uuid) {
        return translate(
          'User {user_link} has granted project member role in project {project_link} to {affected_user_link}.',
          context,
          formatJsxTemplate,
        );
      } else {
        return translate(
          'User {affected_user_link} has got project member role in project {project_link}.',
          context,
          formatJsxTemplate,
        );
      }
    }
  }
};

const formatRoleRevokedEvent = (event: RoleEvent) => {
  if (event.structure_type === 'customer') {
    const context = getCustomerRoleContext(event);
    if (event.role_name === 'Owner') {
      if (event.user_uuid) {
        return translate(
          'User {user_link} has revoked organization owner {affected_user_link} from {customer_link}.',
          context,
          formatJsxTemplate,
        );
      } else {
        return translate(
          'User {affected_user_link} has lost organization owner role in {customer_link}.',
          context,
          formatJsxTemplate,
        );
      }
    } else if (event.role_name === 'Support') {
      if (event.user_uuid) {
        return translate(
          'User {user_link} has revoked organization support {affected_user_link} from {customer_link}.',
          context,
          formatJsxTemplate,
        );
      } else {
        return translate(
          'User {affected_user_link} has lost organization support role in {customer_link}.',
          context,
          formatJsxTemplate,
        );
      }
    }
  } else if (event.structure_type === 'project') {
    const context = getProjectRoleContext(event);
    if (event.role_name === 'Administrator') {
      if (event.user_uuid) {
        return translate(
          'User {user_link} has revoked project administrator {affected_user_link} from project {project_link}.',
          context,
          formatJsxTemplate,
        );
      } else {
        return translate(
          'User {affected_user_link} has lost project administrator role in {project_link}.',
          context,
          formatJsxTemplate,
        );
      }
    } else if (event.role_name === 'Manager') {
      if (event.user_uuid) {
        return translate(
          'User {user_link} has revoked project manager {affected_user_link} from project {project_link}.',
          context,
          formatJsxTemplate,
        );
      } else {
        return translate(
          'User {affected_user_link} has lost project manager role in {project_link}.',
          context,
          formatJsxTemplate,
        );
      }
    } else if (event.role_name === 'Member') {
      if (event.user_uuid) {
        return translate(
          'User {user_link} has revoked project member {affected_user_link} from project {project_link}.',
          context,
          formatJsxTemplate,
        );
      }
    } else {
      return translate(
        'User {affected_user_link} has lost project member role in {project_link}.',
        context,
        formatJsxTemplate,
      );
    }
  }
};

eventsRegistry.registerGroup({
  title: gettext('Role management events'),
  events: [
    {
      key: 'role_granted',
      title: gettext(
        'User {user_link} has granted role to {affected_user_link}.',
      ),
      formatter: formatRoleGrantedEvent,
    },
    {
      key: 'role_revoked',
      title: gettext('User {user_link} has revoked {affected_user_link}.'),
      formatter: formatRoleRevokedEvent,
    },
  ],
});
