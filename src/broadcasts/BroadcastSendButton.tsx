import { ShareIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { broadcastMessagesSend } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const BroadcastSendButton = ({ row, refetch }) => {
  const dispatch = useDispatch();

  const callback = async () => {
    try {
      if (row.state === 'SCHEDULED') {
        try {
          await waitForConfirmation(
            dispatch,
            translate('Confirmation'),
            translate(
              'The broadcast {subject} is scheduled. Are you sure you want to force send it?',
              {
                subject: <strong>{row.subject}</strong>,
              },
              formatJsxTemplate,
            ),
            { type: 'success' },
          );
        } catch {
          return;
        }
      }
      await broadcastMessagesSend({ path: { uuid: row.uuid } });
      await refetch();
      dispatch(showSuccess(translate('Broadcast has been sent.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to send broadcast.')));
    }
  };
  return (
    <ActionItem
      action={callback}
      title={translate('Send')}
      iconNode={<ShareIcon weight="bold" />}
      size="sm"
    />
  );
};
