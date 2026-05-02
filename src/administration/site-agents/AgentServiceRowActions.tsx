import { FC } from 'react';
import {
  AgentService,
  marketplaceSiteAgentServicesDestroy,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';

import { AGENT_SERVICES_QUERY_KEY } from './utils';

interface AgentServiceRowActionsProps {
  row: AgentService;
  refetch: () => void;
}

const AgentServiceDeleteAction: FC<{
  row: AgentService;
  refetch: () => void;
}> = ({ row, refetch }) => {
  const { mutate: mutate, isPending: isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      marketplaceSiteAgentServicesDestroy({
        path: { uuid: row.uuid },
      }),

    refetch: refetch,
    invalidateQueries: [{ queryKey: AGENT_SERVICES_QUERY_KEY }],

    confirmation: {
      title: translate('Delete agent service'),

      body: translate(
        'Are you sure you want to delete agent service "{name}"? This will also delete all associated processors.',
        { name: row.name },
      ),

      options: {
        forDeletion: true,
      },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};

export const AgentServiceRowActions: FC<AgentServiceRowActionsProps> = ({
  row,
  refetch,
}) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[AgentServiceDeleteAction].filter(Boolean)}
    />
  );
};
