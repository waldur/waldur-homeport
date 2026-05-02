import { ShareIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { invoicesSendNotification } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

export const SendNotificationButton: FunctionComponent<{ row }> = ({ row }) => {
  const user = useUser();
  if (!user.is_staff) {
    return null;
  }

  const { mutate, isPending = false } = useManagedMutation<any, any, void>({
    mutationFn: () => invoicesSendNotification({ path: { uuid: row.uuid } }),
    successMessage: translate(
      'Record notification has been sent to organization owners.',
    ),
    errorMessage: translate('Unable to send record notification.'),
  });

  return (
    <ActionItem
      title={translate('Send notification')}
      action={mutate}
      iconNode={<ShareIcon weight="bold" />}
      disabled={row.state !== 'created' || isPending}
      tooltip={
        row.state !== 'created'
          ? translate('Notification can be sent only for created invoice.')
          : ''
      }
    />
  );
};
