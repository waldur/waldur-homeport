import { ENV } from '@waldur/configs/default';
import { PermissionEnum, RoleEnum } from '@waldur/permissions/enums';
import { RootState } from '@waldur/store/reducers';
import { isStaff } from '@waldur/workspace/selectors';

export const canCreateOrganization = (state: RootState): boolean =>
  isStaff(state) ||
  ENV.roles
    .find(({ name }) => name === RoleEnum.CUSTOMER_OWNER)
    .permissions.includes(PermissionEnum.CREATE_CUSTOMER);
