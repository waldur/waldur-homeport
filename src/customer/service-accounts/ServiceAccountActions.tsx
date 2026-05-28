import { FC } from 'react';

import { ActionsDropdown } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { checkHasManageServiceAccountPermission } from '../team/utils';

import { ServiceAccountDeleteAction } from './ServiceAccountDeleteAction';
import { ServiceAccountEditAction } from './ServiceAccountEditAction';
import { ServiceAccountRotateApiKeyAction } from './ServiceAccountRotateApiKeyAction';
import { ServiceAccountsProps } from './type';

export const ServiceAccountActions: FC<
  ServiceAccountsProps & { row; refetch; admin?: boolean }
> = ({ context, scope, row, refetch, admin }) => {
  const user = useUser();
  const canManageServiceAccount = checkHasManageServiceAccountPermission(
    user,
    context,
    scope,
  );

  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      data={{ context, scope }}
      disabled={!admin && !canManageServiceAccount}
      actions={
        admin
          ? [ServiceAccountRotateApiKeyAction]
          : [
              ServiceAccountEditAction,
              ServiceAccountRotateApiKeyAction,
              ServiceAccountDeleteAction,
            ]
      }
      data-cy="service-account-actions-dropdown-btn"
    />
  );
};
