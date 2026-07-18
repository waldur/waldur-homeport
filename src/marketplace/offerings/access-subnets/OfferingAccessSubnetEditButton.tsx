import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

import { OfferingAccessSubnetFormData } from './OfferingAccessSubnetForm';

const OfferingAccessSubnetForm = lazyComponent(() =>
  import('./OfferingAccessSubnetForm').then((module) => ({
    default: module.OfferingAccessSubnetForm,
  })),
);

export const OfferingAccessSubnetEditButton = ({
  row,
  refetch,
}: OfferingAccessSubnetFormData) => (
  <EditModalButton
    dialog={OfferingAccessSubnetForm}
    row={row}
    buildResolve={(r) => ({ row: r, refetch })}
    size="lg"
  />
);
