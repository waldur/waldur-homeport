import { FunctionComponent } from 'react';

import { EditModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const QuickShortcutFormDialog = lazyComponent(() =>
  import('./QuickShortcutForm').then((module) => ({
    default: module.QuickShortcutForm,
  })),
);

export const QuickShortcutEditAction: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => (
  <EditModalButton
    dialog={QuickShortcutFormDialog}
    row={row}
    buildResolve={(r) => ({ shortcut: r, refetch })}
    size="lg"
  />
);
