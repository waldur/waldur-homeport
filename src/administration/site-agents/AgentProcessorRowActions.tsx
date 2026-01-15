import { FC } from 'react';
import {
  AgentProcessor,
  marketplaceSiteAgentProcessorsDestroy,
} from 'waldur-js-client';

import { DeleteButton } from '@waldur/core/buttons';
import { translate } from '@waldur/i18n';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { useInvalidateAgentProcessors } from './utils';

interface AgentProcessorRowActionsProps {
  row: AgentProcessor;
  refetch: () => void;
}

const AgentProcessorDeleteAction: FC<{
  row: AgentProcessor;
  refetch: () => void;
}> = ({ row, refetch }) => {
  const invalidateAgentProcessors = useInvalidateAgentProcessors();

  return (
    <DeleteButton
      row={row}
      apiFunction={(r) =>
        marketplaceSiteAgentProcessorsDestroy({
          path: { uuid: r.uuid },
        })
      }
      refetch={refetch}
      onSuccess={invalidateAgentProcessors}
      confirmTitle={translate('Delete agent processor')}
      confirmMessage={translate(
        'Are you sure you want to delete agent processor "{name}"?',
        { name: row.name },
      )}
      title={translate('Delete')}
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
