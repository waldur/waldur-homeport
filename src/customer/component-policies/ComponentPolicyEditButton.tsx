import { EditModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const ComponentPolicyFormDialog = lazyComponent(() =>
  import('./ComponentPolicyFormDialog').then((module) => ({
    default: module.ComponentPolicyFormDialog,
  })),
);

export const ComponentPolicyEditButton = ({ row, refetch }) => (
  <EditModalButton
    dialog={ComponentPolicyFormDialog}
    row={row}
    buildResolve={(r) => ({ policy: r, refetch })}
    size="lg"
  />
);
