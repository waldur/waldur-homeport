import { FunctionComponent } from 'react';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const AnnouncementCreateDialog = lazyComponent(() =>
  import('./AnnouncementFormDialog').then((module) => ({
    default: module.AnnouncementFormDialog,
  })),
);

export const AnnouncementCreateButton: FunctionComponent<{ refetch }> = ({
  refetch,
}) => (
  <CreateModalButton
    dialog={AnnouncementCreateDialog}
    resolve={{ refetch }}
    size="lg"
  />
);
