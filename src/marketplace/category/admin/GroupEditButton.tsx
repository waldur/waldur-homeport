import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const GroupEditDialog = lazyComponent(() =>
  import('./GroupFromDialog').then((module) => ({
    default: module.GroupFromDialog,
  })),
);

export const GroupEditButton = ({ row, refetch }) => (
  <EditModalButton
    dialog={GroupEditDialog}
    row={row}
    buildResolve={(r) => ({ categoryGroup: r, refetch })}
    size="lg"
  />
);
