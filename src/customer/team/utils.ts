import { usersList, UsersListData } from 'waldur-js-client';

import { count, parseSelectData } from '@/core/api';
import { ENV } from '@/core/config';
import { returnReactSelectAsyncPaginateObject } from '@/core/utils';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { RootState } from '@/store/reducers';
import { getUser } from '@/workspace/selectors';

export const usersAutocomplete = async (
  query: UsersListData['query'],
  prevOptions,
  currentPage: number,
) => {
  const response = await usersList({
    query: {
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
      ...query,
      page: currentPage,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    currentPage,
  );
};

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
