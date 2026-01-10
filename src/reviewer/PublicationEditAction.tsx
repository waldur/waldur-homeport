import { EditModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const PublicationFormDialog = lazyComponent(() =>
  import('./PublicationFormDialog').then((module) => ({
    default: module.PublicationFormDialog,
  })),
);

export const PublicationEditAction = ({
  row,
  refetch,
  profile,
}: {
  row?;
  refetch?;
  profile;
}) => (
  <EditModalButton
    dialog={PublicationFormDialog}
    row={row}
    buildResolve={(r) => ({ publication: r, refetch, profile })}
    size="sm"
  />
);
