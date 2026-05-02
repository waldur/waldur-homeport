import { FC } from 'react';
import { AgentIdentity } from 'waldur-js-client';

import { ActionsDropdown } from '@/table/ActionsDropdown';

import { AgentIdentityDeleteAction } from './AgentIdentityDeleteAction';
import { AgentIdentityEditAction } from './AgentIdentityEditAction';

interface AgentIdentityRowActionsProps {
  row: AgentIdentity;
  refetch: () => void;
}

export const AgentIdentityRowActions: FC<AgentIdentityRowActionsProps> = ({
  row,
  refetch,
}) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[AgentIdentityEditAction, AgentIdentityDeleteAction]}
    />
  );
};
