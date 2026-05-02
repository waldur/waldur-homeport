import { FC } from 'react';
import { AgentIdentity } from 'waldur-js-client';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const AgentIdentityFormDialog = lazyComponent(() =>
  import('./AgentIdentityForm').then((module) => ({
    default: module.AgentIdentityForm,
  })),
);

export const AgentIdentityEditAction: FC<{
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
