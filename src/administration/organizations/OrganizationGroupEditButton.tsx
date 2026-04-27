import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const OrganizationGroupForm = lazyComponent(() =>
  import('./OrganizationGroupForm').then((module) => ({
    default: module.OrganizationGroupForm,
  })),
);

export const OrganizationGroupEditButton = ({ row, refetch }) => (
  <EditModalButton
    dialog={OrganizationGroupForm}
    row={row}
    buildResolve={(r) => ({ organizationGroup: r, refetch })}
    size="lg"
  />
);
