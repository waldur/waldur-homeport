import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const GroupEditDialog = lazyComponent(() =>
  import('./CategoryGroupDialog').then((module) => ({
    default: module.CategoryGroupDialog,
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
