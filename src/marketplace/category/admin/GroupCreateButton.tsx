import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const CategoryGroupDialog = lazyComponent(() =>
  import('./CategoryGroupDialog').then((module) => ({
    default: module.CategoryGroupDialog,
  })),
);

export const GroupCreateButton = ({ refetch }) => (
  <CreateModalButton
    dialog={CategoryGroupDialog}
    resolve={{ refetch }}
    size="lg"
  />
);
