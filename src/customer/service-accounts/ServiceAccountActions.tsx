import { FC } from 'react';
import { useSelector } from 'react-redux';

import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { hasManageServiceAccountPermission } from '../team/utils';

import { ServiceAccountDeleteAction } from './ServiceAccountDeleteAction';
import { ServiceAccountEditAction } from './ServiceAccountEditAction';
import { ServiceAccountRotateApiKeyAction } from './ServiceAccountRotateApiKeyAction';
import { ServiceAccountsProps } from './type';

export const ServiceAccountActions: FC<
  ServiceAccountsProps & { row; refetch; admin?: boolean }
> = ({ context, scope, row, refetch, admin }) => {
  const canManageServiceAccount = useSelector(
    hasManageServiceAccountPermission(context, scope),
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
