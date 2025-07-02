import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

import { ServiceAccountsProps } from './type';

const ServiceAccountFormDialog = lazyComponent(() =>
  import('./ServiceAccountFormDialog').then((module) => ({
    default: module.ServiceAccountFormDialog,
  })),
);

export const ServiceAccountEditAction: FC<
  ServiceAccountsProps & { row; refetch }
> = ({ context, scope, row, refetch }) => {
  const dispatch = useDispatch();

  const callback = () =>
    dispatch(
      openModalDialog(ServiceAccountFormDialog, {
        resolve: { context, scope, refetch, row },
        initialValues: {
          username: row.username,
          email: row.email,
          description: row.description,
        },
      }),
    );

  return <EditAction action={callback} />;
};
