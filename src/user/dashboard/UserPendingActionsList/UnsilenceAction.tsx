import { BellIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { UserAction, userActionsUnsilence } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const UnsilenceAction: FC<{ row: UserAction; refetch?: () => void }> = ({
  row,
  refetch,
}) => {
  const dispatch = useDispatch();

  const handleUnsilence = async () => {
    try {
      await userActionsUnsilence({
        path: { uuid: row.uuid as any },
      });
      dispatch(
        showSuccess(translate('Action has been unsilenced successfully.')),
      );
      if (refetch) {
        refetch();
      }
    } catch (e) {
      if (e.response?.status === 404) {
        dispatch(
          showErrorResponse(
            e,
            translate('Action not found or no longer available.'),
          ),
        );
      } else {
        dispatch(
          showErrorResponse(e, translate('Unable to unsilence action.')),
        );
      }
    }
  };

  return (
    <ActionItem
      title={translate('Unmute')}
      action={handleUnsilence}
      iconNode={<BellIcon weight="bold" />}
    />
  );
};
