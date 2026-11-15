import { ConnectedApp, oauthConnectedAppsDestroy } from 'waldur-js-client';

import { getErrorStatus } from '@/error/utils';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const ConnectedAppRevokeButton = ({
  row,
  refetch,
}: {
  row: ConnectedApp;
  refetch(): void;
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: async () => {
      try {
        await oauthConnectedAppsDestroy({ path: { uuid: row.uuid } });
      } catch (error) {
        // Revoked elsewhere, or its tokens lapsed: the app has no access
        // either way, and the reload drops its row.
        if (getErrorStatus(error) !== 404) {
          throw error;
        }
      }
    },
    refetch,
    confirmation: {
      title: translate('Revoke access'),
      body: translate(
        '{app} will no longer be able to access your account. To use it again, you have to connect it again.',
        { app: row.client_name },
      ),
      options: {
        forDeletion: true,
        positiveButton: translate('Revoke'),
      },
    },
    successMessage: translate('Access has been revoked.'),
    errorMessage: translate('Unable to revoke access.'),
  });

  return (
    <RemovalActionItem
      title={translate('Revoke')}
      action={() => mutate()}
      disabled={isPending}
    />
  );
};
