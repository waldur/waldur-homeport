import { usersList } from 'waldur-js-client';

import { count } from '@/core/api';
import { createLoadOptions } from '@/form/select';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { RootState } from '@/store/reducers';
import { getUser } from '@/workspace/selectors';

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
  count(`/api/customers/${customerUuid}/users/`);

export const hasManageServiceAccountPermission =
  (context, scope) => (state: RootState) => {
    const user = getUser(state);
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

export const hasManageCourseAccountPermission =
  (project) => (state: RootState) => {
    const user = getUser(state);
    return hasPermission(user, {
      permission: PermissionEnum.MANAGE_COURSE_ACCOUNT,
      projectId: project.uuid,
    });
  };
