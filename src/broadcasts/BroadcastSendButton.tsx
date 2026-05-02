import { ShareIcon } from '@phosphor-icons/react';
import { broadcastMessagesSend } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const BroadcastSendButton = ({ row, refetch }) => {
  const sendMutation = useManagedMutation<any, any, void>({
    mutationFn: () => broadcastMessagesSend({ path: { uuid: row.uuid } }),
    successMessage: translate('Broadcast has been sent.'),
    errorMessage: translate('Unable to send broadcast.'),
    refetch,
    confirmation:
      row.state === 'SCHEDULED'
        ? {
            title: translate('Confirmation'),
            body: translate(
              'The broadcast {subject} is scheduled. Are you sure you want to force send it?',
              {
                subject: <strong>{row.subject}</strong>,
              },
              formatJsxTemplate,
            ),
            options: { type: 'success' },
          }
        : undefined,
  });
  return (
    <ActionItem
      action={() => sendMutation.mutate()}
      disabled={sendMutation.isPending}
      title={translate('Send')}
      iconNode={<ShareIcon weight="bold" />}
      size="sm"
    />
  );
};
