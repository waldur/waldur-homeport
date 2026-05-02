import { FC } from 'react';
import {
  AgentIdentity,
  marketplaceSiteAgentIdentitiesDestroy,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const AgentIdentityDeleteAction: FC<{
  row: AgentIdentity;
  refetch: () => void;
}> = ({ row, refetch }) => {
  const { mutate: handleDelete, isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      marketplaceSiteAgentIdentitiesDestroy({
        path: { uuid: row.uuid },
      }),
    refetch,
    invalidateQueries: [{ queryKey: ['agent-identities'] }],
    successMessage: translate('Agent identity deleted successfully'),
    errorMessage: translate('Failed to delete agent identity'),
    confirmation: {
      title: translate('Delete agent identity'),
      body: translate(
        'Are you sure you want to delete agent identity "{name}"? This will also delete all associated services and processors.',
        { name: row.name },
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={() => handleDelete()}
      disabled={isPending}
    />
  );
};
