import { PencilSimple } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

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
    <RowActionButton
      action={() =>
        dispatch(
          openModalDialog(ProviderOfferingUserUpdateDialog, {
            resolve: props,
            size: 'lg',
          }),
        )
      }
      title={translate('Edit')}
      iconNode={<PencilSimple />}
      size="sm"
    />
  );
};
