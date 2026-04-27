import { FunctionComponent } from 'react';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const BroadcastTemplateUpdateDialog = lazyComponent(() =>
  import('./BroadcastTemplateUpdateDialog').then((module) => ({
    default: module.BroadcastTemplateUpdateDialog,
  })),
);

export const BroadcastTemplateUpdateButton: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => (
  <EditModalButton
    dialog={BroadcastTemplateUpdateDialog}
    row={row}
    buildResolve={(r) => ({ template: r, refetch })}
    size="lg"
  />
);
