import { EnvelopeIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { usersSendNotification } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface SendNotificationActionProps {
  userUuid: string;
}

export const SendNotificationAction: FC<SendNotificationActionProps> = ({
  userUuid,
}) => {
  const { mutate: handleSendNotification, isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () => usersSendNotification({ path: { uuid: userUuid } }),
    successMessage: translate('Notification has been scheduled.'),
    errorMessage: translate('Unable to send notification.'),
  });

  return (
    <ActionItem
      title={translate('Send notification')}
      action={() => handleSendNotification()}
      iconNode={<EnvelopeIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
