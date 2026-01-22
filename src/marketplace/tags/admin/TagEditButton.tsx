import { Tag } from 'waldur-js-client';

import { EditModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const TagFormDialog = lazyComponent(() =>
  import('./TagFormDialog').then((module) => ({
    default: module.TagFormDialog,
  })),
);

interface TagEditButtonProps {
  row: Tag;
  refetch: () => void;
}

export const TagEditButton = ({ row, refetch }: TagEditButtonProps) => (
  <EditModalButton
    dialog={TagFormDialog}
    row={row}
    buildResolve={(r) => ({ tag: r, refetch })}
    size="lg"
  />
);
