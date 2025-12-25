import { FunctionComponent } from 'react';

import { CreateModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const BroadcastCreateDialog = lazyComponent(() =>
  import('./BroadcastFormDialog').then((module) => ({
    default: module.BroadcastFormDialog,
  })),
);

export const BroadcastCreateButton: FunctionComponent<{ refetch }> = ({
  refetch,
}) => (
  <CreateModalButton
    dialog={BroadcastCreateDialog}
    resolve={{ refetch }}
    size="xl"
  />
);
