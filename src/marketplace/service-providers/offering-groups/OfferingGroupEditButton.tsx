import { OfferingGroup } from 'waldur-js-client';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const OfferingGroupFormDialog = lazyComponent(() =>
  import('./OfferingGroupFormDialog').then((module) => ({
    default: module.OfferingGroupFormDialog,
  })),
);

interface OfferingGroupEditButtonProps {
  row: OfferingGroup;
  refetch: () => void;
  customerUrl?: string;
}

export const OfferingGroupEditButton = ({
  row,
  refetch,
  customerUrl,
}: OfferingGroupEditButtonProps) => (
  <EditModalButton
    dialog={OfferingGroupFormDialog}
    row={row}
    buildResolve={(r) => ({ group: r, customerUrl, refetch })}
    size="lg"
  />
);
