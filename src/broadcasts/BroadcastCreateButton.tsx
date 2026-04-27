import { FunctionComponent } from 'react';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

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
