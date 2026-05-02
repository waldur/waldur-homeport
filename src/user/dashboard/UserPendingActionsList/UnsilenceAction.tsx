import { BellIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { UserAction, userActionsUnsilence } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';

export const UnsilenceAction: FC<{ row: UserAction; refetch?: () => void }> = ({
  row,
  refetch,
}) => {
  const { showErrorResponse, showSuccess } = useNotify();

  const handleUnsilence = async () => {
    try {
      await userActionsUnsilence({
        path: { uuid: row.uuid as any },
      });
      showSuccess(translate('Action has been unsilenced successfully.'));
      if (refetch) {
        refetch();
      }
    } catch (e) {
      if (e.response?.status === 404) {
        showErrorResponse(
          e,
          translate('Action not found or no longer available.'),
        );
      } else {
        showErrorResponse(e, translate('Unable to unsilence action.'));
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
