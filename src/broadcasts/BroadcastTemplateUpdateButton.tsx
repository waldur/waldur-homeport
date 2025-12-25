import { FunctionComponent } from 'react';

import { EditModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

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
