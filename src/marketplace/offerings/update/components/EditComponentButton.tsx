import { FunctionComponent } from 'react';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const OfferingComponentDialog = lazyComponent(() =>
  import('./OfferingComponentDialog').then((module) => ({
    default: module.OfferingComponentDialog,
  })),
);

export const EditComponentButton: FunctionComponent<{
  offering;
  component;
  refetch;
}> = ({ offering, component, refetch }) => (
  <EditModalButton
    dialog={OfferingComponentDialog}
    row={component}
    buildResolve={(r) => ({ offering, component: r, refetch })}
  />
);
