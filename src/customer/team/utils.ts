import {
  PROJECT_ADMIN_ROLE,
  PROJECT_MANAGER_ROLE,
  PROJECT_MEMBER_ROLE,
} from '@waldur/core/constants';
import { ENV } from '@waldur/core/services';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';

export const getRoles = () => {
  const roles = [
    {
      value: PROJECT_ADMIN_ROLE,
      label: translate(ENV.roles.admin),
    },
    {
      value: PROJECT_MANAGER_ROLE,
      label: translate(ENV.roles.manager),
    },
  ];
  if (isFeatureVisible('project.support')) {
    roles.push({
      value: PROJECT_MEMBER_ROLE,
      label: translate(ENV.roles.member),
    });
  }
  return roles.sort((a, b) => a.label.localeCompare(b.label));
};
