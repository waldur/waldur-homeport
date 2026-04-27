import { FC } from 'react';
import {
  AgentService,
  marketplaceSiteAgentServicesDestroy,
} from 'waldur-js-client';

import { DeleteButton } from '@/core/buttons';
import { translate } from '@/i18n';
import { ActionsDropdown } from '@/table/ActionsDropdown';

import { useInvalidateAgentServices } from './utils';

interface AgentServiceRowActionsProps {
  row: AgentService;
  refetch: () => void;
}

const AgentServiceDeleteAction: FC<{
  row: AgentService;
  refetch: () => void;
}> = ({ row, refetch }) => {
  const invalidateAgentServices = useInvalidateAgentServices();

  return (
    <DeleteButton
      row={row}
      apiFunction={(r) =>
        marketplaceSiteAgentServicesDestroy({
          path: { uuid: r.uuid },
        })
      }
      refetch={refetch}
      onSuccess={invalidateAgentServices}
      confirmTitle={translate('Delete agent service')}
      confirmMessage={translate(
        'Are you sure you want to delete agent service "{name}"? This will also delete all associated processors.',
        { name: row.name },
      )}
      title={translate('Delete')}
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
