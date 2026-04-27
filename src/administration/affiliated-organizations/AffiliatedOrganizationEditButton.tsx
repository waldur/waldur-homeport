import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const AffiliatedOrganizationForm = lazyComponent(() =>
  import('./AffiliatedOrganizationForm').then((module) => ({
    default: module.AffiliatedOrganizationForm,
  })),
);

export const AffiliatedOrganizationEditButton = ({ row, refetch }) => (
  <EditModalButton
    dialog={AffiliatedOrganizationForm}
    row={row}
    buildResolve={(r) => ({ affiliatedOrganization: r, refetch })}
    size="lg"
  />
);
