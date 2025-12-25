import { CreateModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const CategoryCreateDialog = lazyComponent(() =>
  import('./CategoryEditDialog').then((module) => ({
    default: module.CategoryEditDialog,
  })),
);

export const CategoryCreateButton = ({ refetch }) => (
  <CreateModalButton
    dialog={CategoryCreateDialog}
    resolve={{ refetch }}
    size="lg"
  />
);
