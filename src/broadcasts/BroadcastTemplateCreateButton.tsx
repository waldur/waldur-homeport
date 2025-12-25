import { FunctionComponent } from 'react';

import { CreateModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const BroadcastTemplateCreateDialog = lazyComponent(() =>
  import('./BroadcastTemplateCreateDialog').then((module) => ({
    default: module.BroadcastTemplateCreateDialog,
  })),
);

export const BroadcastTemplateCreateButton: FunctionComponent<{ refetch }> = ({
  refetch,
}) => (
  <CreateModalButton
    dialog={BroadcastTemplateCreateDialog}
    resolve={{ refetch }}
    size="lg"
  />
);
