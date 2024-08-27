import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

import { ServiceProvider } from '../types';

import { OfferingUser } from './types';

const ProviderOfferingUserUpdateDialog = lazyComponent(
  () => import('./ProviderOfferingUserUpdateDialog'),
  'ProviderOfferingUserUpdateDialog',
);

export const ProviderOfferingUserUpdateButton: FC<{
  row: OfferingUser;
  provider: ServiceProvider;
  refetch;
}> = (props) => {
  const dispatch = useDispatch();
  return (
    <EditButton
      onClick={() =>
        dispatch(
          openModalDialog(ProviderOfferingUserUpdateDialog, {
            resolve: props,
            size: 'lg',
          }),
        )
      }
      size="sm"
    />
  );
};
