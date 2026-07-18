import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

import { ResourceAccessSubnetFormData } from './ResourceAccessSubnetForm';

const ResourceAccessSubnetForm = lazyComponent(() =>
  import('./ResourceAccessSubnetForm').then((module) => ({
    default: module.ResourceAccessSubnetForm,
  })),
);

export const ResourceAccessSubnetEditButton = ({
  row,
  refetch,
}: ResourceAccessSubnetFormData) => (
  <EditModalButton
    dialog={ResourceAccessSubnetForm}
    row={row}
    buildResolve={(r) => ({ row: r, refetch })}
    size="lg"
  />
);
