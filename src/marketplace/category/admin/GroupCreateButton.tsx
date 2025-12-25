import { CreateModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const GroupCreateDialog = lazyComponent(() =>
  import('./GroupFromDialog').then((module) => ({
    default: module.GroupFromDialog,
  })),
);

export const GroupCreateButton = ({ refetch }) => (
  <CreateModalButton
    dialog={GroupCreateDialog}
    resolve={{ refetch }}
    size="lg"
  />
);
