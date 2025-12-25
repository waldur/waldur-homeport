import { FunctionComponent } from 'react';

import { EditModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const NotificationUpdateDialog = lazyComponent(() =>
  import('./NotificationUpdateDialog').then((module) => ({
    default: module.NotificationUpdateDialog,
  })),
);

export const NotificationUpdateButton: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => (
  <EditModalButton
    dialog={NotificationUpdateDialog}
    row={row}
    buildResolve={(r) => ({ notification: r, refetch })}
    size="xl"
  />
);
