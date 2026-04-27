import { FunctionComponent } from 'react';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const SoftwareCatalogDialog = lazyComponent(() =>
  import('./SoftwareCatalogDialog').then((module) => ({
    default: module.SoftwareCatalogDialog,
  })),
);

export const EditSoftwareCatalogButton: FunctionComponent<{
  offering;
  softwareCatalog;
  refetch;
}> = ({ offering, softwareCatalog, refetch }) => (
  <EditModalButton
    dialog={SoftwareCatalogDialog}
    row={softwareCatalog}
    buildResolve={(r) => ({
      mode: 'edit' as const,
      offering,
      softwareCatalog: r,
      refetch,
    })}
  />
);
