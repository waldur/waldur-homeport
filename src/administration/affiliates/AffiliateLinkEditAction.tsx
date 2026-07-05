import { FC } from 'react';
import { CustomerAffiliate } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { useModal } from '@/modal/actions';

const AffiliateLinkFormDialog = lazyComponent(() =>
  import('./AffiliateLinkFormDialog').then((module) => ({
    default: module.AffiliateLinkFormDialog,
  })),
);

interface AffiliateLinkEditActionProps {
  row: CustomerAffiliate;
  refetch(): void;
}

export const AffiliateLinkEditAction: FC<AffiliateLinkEditActionProps> = ({
  row,
  refetch,
}) => {
  const { openDialog } = useModal();

  const callback = () =>
    openDialog(AffiliateLinkFormDialog, {
      resolve: { row, refetch },
    });

  return <EditAction action={callback} />;
};
