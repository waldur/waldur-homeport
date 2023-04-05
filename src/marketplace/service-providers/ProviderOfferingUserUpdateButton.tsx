import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButtonSmall } from '@waldur/table/ActionButtonSmall';

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
    <ActionButtonSmall
      title={translate('Edit')}
      className="ms-2 rounded btn-light border-0"
      action={() =>
        dispatch(
          openModalDialog(ProviderOfferingUserUpdateDialog, {
            resolve: props,
            size: 'lg',
          }),
        )
      }
    >
      <i className="fa fa-edit" />
    </ActionButtonSmall>
  );
};
