import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const CategoryEditDialog = lazyComponent(() =>
  import('./CategoryEditDialog').then((module) => ({
    default: module.CategoryEditDialog,
  })),
);

export const CategoryEditAction = ({ row, refetch }) => (
  <EditModalButton
    dialog={CategoryEditDialog}
    row={row}
    buildResolve={(r) => ({ category: r, refetch })}
    size="lg"
  />
);
