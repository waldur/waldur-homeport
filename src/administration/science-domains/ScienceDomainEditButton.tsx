import { EditModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const ScienceDomainForm = lazyComponent(() =>
  import('./ScienceDomainForm').then((module) => ({
    default: module.ScienceDomainForm,
  })),
);

export const ScienceDomainEditButton = ({ row, refetch }) => (
  <EditModalButton
    dialog={ScienceDomainForm}
    row={row}
    buildResolve={(r) => ({ scienceDomain: r, refetch })}
  />
);
