import { EditModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const RoleMappingFormDialog = lazyComponent(() =>
  import('./RoleMappingFormDialog').then((module) => ({
    default: module.RoleMappingFormDialog,
  })),
);

export const RoleMappingEditAction = ({ row, refetch }) => (
  <EditModalButton
    dialog={RoleMappingFormDialog}
    row={row}
    buildResolve={(r) => ({ mapping: r, refetch })}
    size="sm"
  />
);
