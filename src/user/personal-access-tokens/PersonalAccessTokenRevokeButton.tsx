import { personalAccessTokensDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const PersonalAccessTokenRevokeButton = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => personalAccessTokensDestroy({ path: { uuid: row.uuid } }),
    refetch: refetch,

    confirmation: {
      title: translate('Revoke token'),

      body: translate(
        'Are you sure you want to revoke this token? This action cannot be undone.',
      ),

      options: {
        forDeletion: true,
      },
    },

    successMessage: translate('Token has been revoked.'),
    errorMessage: translate('Unable to revoke token.'),
  });

  return (
    <RemovalActionItem
      title={translate('Revoke')}
      action={mutate}
      disabled={isPending}
    />
  );
};
