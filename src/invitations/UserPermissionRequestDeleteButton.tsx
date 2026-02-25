import { FunctionComponent } from 'react';
import { userPermissionRequestsCancelRequest } from 'waldur-js-client';

import { DeleteButton } from '@waldur/core/buttons';
import { translate } from '@waldur/i18n';

interface UserPermissionRequestDeleteButtonProps {
  row: any;
  refetch: () => void;
}

export const UserPermissionRequestDeleteButton: FunctionComponent<
  UserPermissionRequestDeleteButtonProps
> = ({ row, refetch }) => (
  <DeleteButton
    row={row}
    apiFunction={(r) =>
      userPermissionRequestsCancelRequest({ path: { uuid: r.uuid } })
    }
    confirmTitle={translate('Delete permission request')}
    confirmMessage={translate(
      'Are you sure you would like to delete the permission request by {name}?',
      { name: row.created_by_full_name },
    )}
    successMessage={translate('Permission request has been deleted.')}
    errorMessage={translate('Unable to delete permission request.')}
    refetch={refetch}
  />
);
