import { EditModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const AffiliationFormDialog = lazyComponent(() =>
  import('./AffiliationFormDialog').then((module) => ({
    default: module.AffiliationFormDialog,
  })),
);

export const AffiliationEditAction = ({
  row,
  refetch,
  profile,
}: {
  row?;
  refetch?;
  profile;
}) => (
  <EditModalButton
    dialog={AffiliationFormDialog}
    row={row}
    buildResolve={(r) => ({ affiliation: r, refetch, profile })}
    size="sm"
  />
);
