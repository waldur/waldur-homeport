import { CheckSquareIcon, XSquareIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { rolesDisable, rolesEnable } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const RoleToggleButton: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    if (row.is_active) {
      try {
        await rolesDisable({ path: { uuid: row.uuid } });
        dispatch(showSuccess(translate('The role has been disabled')));
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Error disabling the role.')),
        );
      }
    } else {
      try {
        await rolesEnable({ path: { uuid: row.uuid } });
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
    <ActionItem
      action={callback}
      title={row.is_active ? translate('Disable') : translate('Enable')}
      iconNode={
        row.is_active ? (
          <XSquareIcon weight="bold" />
        ) : (
          <CheckSquareIcon weight="bold" />
        )
      }
    />
  );
};
