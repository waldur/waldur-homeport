import { FC } from 'react';

import { CreateModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const AgentIdentityFormDialog = lazyComponent(() =>
  import('./AgentIdentityForm').then((module) => ({
    default: module.AgentIdentityForm,
  })),
);

interface AgentIdentityCreateButtonProps {
  refetch: () => void;
}

export const AgentIdentityCreateButton: FC<AgentIdentityCreateButtonProps> = ({
  refetch,
}) => (
  <CreateModalButton
    dialog={AgentIdentityFormDialog}
    resolve={{ refetch }}
    size="lg"
  />
);
