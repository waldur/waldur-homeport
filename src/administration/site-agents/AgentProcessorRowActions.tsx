import { FC } from 'react';
import {
  AgentProcessor,
  marketplaceSiteAgentProcessorsDestroy,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';

import { AGENT_PROCESSORS_QUERY_KEY } from './utils';

interface AgentProcessorRowActionsProps {
  row: AgentProcessor;
  refetch: () => void;
}

const AgentProcessorDeleteAction: FC<{
  row: AgentProcessor;
  refetch: () => void;
}> = ({ row, refetch }) => {
  const { mutate: mutate, isPending: isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      marketplaceSiteAgentProcessorsDestroy({
        path: { uuid: row.uuid },
      }),

    refetch: refetch,
    invalidateQueries: [{ queryKey: AGENT_PROCESSORS_QUERY_KEY }],

    confirmation: {
      title: translate('Delete agent processor'),

      body: translate(
        'Are you sure you want to delete agent processor "{name}"?',
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

export const AgentProcessorRowActions: FC<AgentProcessorRowActionsProps> = ({
  row,
  refetch,
}) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[AgentProcessorDeleteAction].filter(Boolean)}
    />
  );
};
