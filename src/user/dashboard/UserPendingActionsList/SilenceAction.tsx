import { BellSlashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { UserAction, userActionsSilence } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const SilenceAction: FC<{ row: UserAction; refetch?: () => void }> = ({
  row,
  refetch,
}) => {
  const dispatch = useDispatch();

  const handleSilence = async () => {
    try {
      await userActionsSilence({
        path: { uuid: row.uuid as any },
      });
      dispatch(
        showSuccess(translate('Action has been silenced successfully.')),
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
        dispatch(showErrorResponse(e, translate('Unable to silence action.')));
      }
    }
  };

  return (
    <ActionItem
      title={translate('Mute')}
      action={handleSilence}
      iconNode={<BellSlashIcon weight="bold" />}
    />
  );
};
