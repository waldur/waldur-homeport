import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

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
