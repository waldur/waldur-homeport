import { ENV } from '@waldur/configs/default';
import {
  CUSTOMER_OWNER_ROLE,
  PROJECT_ADMIN_ROLE,
  PROJECT_MANAGER_ROLE,
  PROJECT_MEMBER_ROLE,
} from '@waldur/core/constants';
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

export const getOrganizationRoles = () => [
  {
    value: CUSTOMER_OWNER_ROLE,
    label: translate(ENV.roles.owner),
  },
];
