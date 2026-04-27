import { FunctionComponent } from 'react';
import type { ArrowCustomerMapping } from 'waldur-js-client';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const CustomerMappingEditDialog = lazyComponent(() =>
  import('./CustomerMappingEditDialog').then((module) => ({
    default: module.CustomerMappingEditDialog,
  })),
);

export const CustomerMappingEditAction: FunctionComponent<{
  row: ArrowCustomerMapping;
  refetch: () => void;
}> = ({ row, refetch }) => (
  <EditModalButton
    dialog={CustomerMappingEditDialog}
    row={row}
    buildResolve={(r) => ({ mapping: r, refetch })}
    size="lg"
  />
);
