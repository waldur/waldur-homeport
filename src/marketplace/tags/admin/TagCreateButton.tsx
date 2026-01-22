import { CreateModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const TagFormDialog = lazyComponent(() =>
  import('./TagFormDialog').then((module) => ({
    default: module.TagFormDialog,
  })),
);

export const TagCreateButton = ({ refetch }) => (
  <CreateModalButton dialog={TagFormDialog} resolve={{ refetch }} size="lg" />
);
