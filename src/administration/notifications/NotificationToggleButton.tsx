import { BellSimpleIcon, BellSimpleSlashIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import {
  notificationMessagesDisable,
  notificationMessagesEnable,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const NotificationToggleButton: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      row.enabled
        ? notificationMessagesDisable({ path: { uuid: row.uuid } })
        : notificationMessagesEnable({ path: { uuid: row.uuid } }),
    successMessage: row.enabled
      ? translate('The notification has been disabled')
      : translate('The notification has been enabled'),
    errorMessage: row.enabled
      ? translate('Error disabling the notification.')
      : translate('Error enabling the notification.'),
    refetch,
  });
  return (
    <ActionItem
      action={mutate}
      disabled={isPending}
      title={row.enabled ? translate('Disable') : translate('Enable')}
      iconNode={
        row.enabled ? (
          <BellSimpleIcon weight="bold" />
        ) : (
          <BellSimpleSlashIcon weight="bold" />
        )
      }
      size="sm"
      className={row.enabled ? 'text-warning' : 'text-success'}
      iconColor={row.enabled ? 'warning' : 'success'}
    />
  );
};
