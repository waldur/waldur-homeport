import { CheckSquareIcon, XSquareIcon } from '@phosphor-icons/react';
import { supportUsersPartialUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const SupportUserToggleButton = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      supportUsersPartialUpdate({
        path: { uuid: row.uuid },
        body: { is_active: !row.is_active },
      }),
    successMessage: row.is_active
      ? translate('The support user has been deactivated.')
      : translate('The support user has been activated.'),
    errorMessage: row.is_active
      ? translate('Unable to deactivate support user.')
      : translate('Unable to activate support user.'),
    refetch,
  });
  return (
    <ActionItem
      action={mutate}
      disabled={isPending}
      title={row.is_active ? translate('Deactivate') : translate('Activate')}
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
