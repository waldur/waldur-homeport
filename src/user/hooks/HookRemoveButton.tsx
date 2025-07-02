import { TrashIcon } from '@phosphor-icons/react';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { hooksEmailDestroy, hooksWebDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface HookRemoveButtonProps {
  refetch();
  row;
}

export const HookRemoveButton: FC<HookRemoveButtonProps> = ({
  row: hook,
  refetch,
}) => {
  const [removing, setRemoving] = useState(false);
  const dispatch = useDispatch();

  const action = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Hook removal'),
        translate('Are you sure you would like to delete the hook?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      setRemoving(true);
      if (hook.hook_type == 'email') {
        await hooksEmailDestroy({
          path: { uuid: hook.uuid },
        });
      } else {
        await hooksWebDestroy({
          path: { uuid: hook.uuid },
        });
      }
      await refetch();
      dispatch(showSuccess(translate('Hook has been removed.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to remove hook.')));
    }
    setRemoving(false);
  };

  return (
    <ActionItem
      title={translate('Remove')}
      action={action}
      disabled={removing}
      iconNode={<TrashIcon weight="bold" />}
      size="sm"
      className="text-danger"
      iconColor="danger"
    />
  );
};
