import { passkeysRevoke } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const PasskeyRevokeButton = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      passkeysRevoke({ path: { uuid: row.uuid }, body: { reason: '' } as any }),
    refetch,

    confirmation: {
      title: translate('Revoke passkey'),
      body: translate(
        'Are you sure you want to revoke this passkey? You will no longer be able to sign in with it. This action cannot be undone.',
      ),
      options: {
        forDeletion: true,
      },
    },

    successMessage: translate('Passkey has been revoked.'),
    errorMessage: translate('Unable to revoke passkey.'),
  });

  return (
    <RemovalActionItem
      title={translate('Revoke')}
      action={mutate}
      disabled={isPending}
    />
  );
};
