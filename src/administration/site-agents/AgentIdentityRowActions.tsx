import { FC } from 'react';
import {
  AgentIdentity,
  marketplaceSiteAgentIdentitiesDestroy,
} from 'waldur-js-client';

import { DeleteButton, EditModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { useInvalidateAgentIdentities } from './utils';

const AgentIdentityFormDialog = lazyComponent(() =>
  import('./AgentIdentityForm').then((module) => ({
    default: module.AgentIdentityForm,
  })),
);

interface AgentIdentityRowActionsProps {
  row: AgentIdentity;
  refetch: () => void;
}

const AgentIdentityEditAction: FC<{
  row: AgentIdentity;
  refetch: () => void;
}> = ({ row, refetch }) => (
  <EditModalButton
    dialog={AgentIdentityFormDialog}
    row={row}
    buildResolve={(r) => ({ identity: r, refetch })}
    size="lg"
  />
);

const AgentIdentityDeleteAction: FC<{
  row: AgentIdentity;
  refetch: () => void;
}> = ({ row, refetch }) => {
  const invalidateAgentIdentities = useInvalidateAgentIdentities();

  return (
    <DeleteButton
      row={row}
      apiFunction={(r) =>
        marketplaceSiteAgentIdentitiesDestroy({
          path: { uuid: r.uuid },
        })
      }
      refetch={refetch}
      onSuccess={invalidateAgentIdentities}
      confirmTitle={translate('Delete agent identity')}
      confirmMessage={translate(
        'Are you sure you want to delete agent identity "{name}"? This will also delete all associated services and processors.',
        { name: row.name },
      )}
      title={translate('Delete')}
    />
  );
};

export const AgentIdentityRowActions: FC<AgentIdentityRowActionsProps> = ({
  row,
  refetch,
}) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[AgentIdentityEditAction, AgentIdentityDeleteAction].filter(
        Boolean,
      )}
    />
  );
};
