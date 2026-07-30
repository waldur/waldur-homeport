import { FC } from 'react';
import { NestedQoS } from 'waldur-js-client';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const OfferingQoSFormDialog = lazyComponent(() =>
  import('./OfferingQoSFormDialog').then((module) => ({
    default: module.OfferingQoSFormDialog,
  })),
);

export const EditOfferingQoSButton: FC<{
  row: NestedQoS;
  offering;
  refetch;
}> = ({ offering, row, refetch }) => (
  <EditModalButton
    dialog={OfferingQoSFormDialog}
    row={row}
    buildResolve={(r) => ({ offering, qos: r, refetch })}
  />
);
