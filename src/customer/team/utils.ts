import { customersUsersCount, usersList, User } from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { createLoadOptions } from '@/form/select';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';

export const usersAutocomplete = createLoadOptions(usersList, 'query', {
  field: [
    'full_name',
    'url',
    'email',
    'uuid',
    'username',
    'registration_method',
    'is_active',
  ],
  o: ['full_name'],
});

export const getCustomerUsersCount = (customerUuid: string) =>
  customersUsersCount({
    path: { customer_uuid: customerUuid },
  }).then(fetchResultCount);

export const checkHasManageServiceAccountPermission = (
  user: User,
  context: 'customer' | 'project',
  scope: any,
) => {
  const customerUuid =
    context === 'project' ? scope?.customer_uuid : scope?.uuid;

  const hasCustomerPermission = hasPermission(user, {
    permission: PermissionEnum.MANAGE_SERVICE_ACCOUNT,
    customerId: customerUuid,
  });
  return (
    hasCustomerPermission ||
    (context === 'project' &&
      hasPermission(user, {
        permission: PermissionEnum.MANAGE_SERVICE_ACCOUNT,
        projectId: scope.uuid,
      }))
  );
};

export const checkHasManageCourseAccountPermission = (
  user: User,
  project: { uuid: string },
) =>
  hasPermission(user, {
    permission: PermissionEnum.MANAGE_COURSE_ACCOUNT,
    projectId: project.uuid,
  });
