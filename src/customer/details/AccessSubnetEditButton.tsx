import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

import { AccessSubnetFormData } from './AccessSubnetForm';

const AccessSubnetForm = lazyComponent(() =>
  import('./AccessSubnetForm').then((module) => ({
    default: module.AccessSubnetForm,
  })),
);

export const AccessSubnetEditButton = ({
  row,
  refetch,
}: AccessSubnetFormData) => (
  <EditModalButton
    dialog={AccessSubnetForm}
    row={row}
    buildResolve={(r) => ({ row: r, refetch })}
    size="lg"
  />
);
