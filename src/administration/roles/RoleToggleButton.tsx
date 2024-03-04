import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { disableRole, enableRole } from '@waldur/administration/roles/api';
import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

export const RoleToggleButton: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    if (row.is_active) {
      try {
        await disableRole(row.uuid);
        dispatch(showSuccess(translate('The role has been disabled')));
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Error disabling the role.')),
        );
      }
    } else {
      try {
        await enableRole(row.uuid);
        dispatch(showSuccess(translate('The role has been enabled')));
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Error enabling the role.')),
        );
      }
    }
    refetch();
  };
  return (
    <ActionButton
      action={callback}
      title={row.is_active ? translate('Disable') : translate('Enable')}
      icon={row.is_active ? 'fa fa-toggle-on' : 'fa fa-toggle-off'}
      className={`ms-3 btn ${row.is_active ? 'btn-danger' : 'btn-success'}`}
    />
  );
};
