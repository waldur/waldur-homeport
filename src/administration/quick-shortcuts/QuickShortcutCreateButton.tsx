import { FunctionComponent } from 'react';

import { CreateModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const QuickShortcutCreateDialog = lazyComponent(() =>
  import('./QuickShortcutForm').then((module) => ({
    default: module.QuickShortcutForm,
  })),
);

export const QuickShortcutCreateButton: FunctionComponent<{ refetch }> = ({
  refetch,
}) => (
  <CreateModalButton
    dialog={QuickShortcutCreateDialog}
    resolve={{ refetch }}
    size="lg"
  />
);
