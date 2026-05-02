import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { useModal } from '@/modal/actions';

import { ServiceAccountsProps } from './type';

const ServiceAccountFormDialog = lazyComponent(() =>
  import('./ServiceAccountFormDialog').then((module) => ({
    default: module.ServiceAccountFormDialog,
  })),
);

export const ServiceAccountEditAction: FC<
  ServiceAccountsProps & { row; refetch }
> = ({ context, scope, row, refetch }) => {
  const { openDialog } = useModal();

  const callback = () =>
    openDialog(ServiceAccountFormDialog, {
      resolve: { context, scope, refetch, row },
      initialValues: {
        username: row.username,
        email: row.email,
        description: row.description,
      },
    });

  return <EditAction action={callback} />;
};
