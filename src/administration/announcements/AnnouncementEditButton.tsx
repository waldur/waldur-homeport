import { FunctionComponent } from 'react';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const AnnouncementFormDialog = lazyComponent(() =>
  import('./AnnouncementFormDialog').then((module) => ({
    default: module.AnnouncementFormDialog,
  })),
);

export const AnnouncementEditButton: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => (
  <EditModalButton
    dialog={AnnouncementFormDialog}
    row={row}
    buildResolve={(r) => ({ announcement: r, refetch })}
    size="lg"
  />
);
