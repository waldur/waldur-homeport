import { Pencil } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { getUser } from '@waldur/workspace/selectors';

import { ServiceProvider } from '../types';

import { OfferingUser } from './types';

const ProviderOfferingUserUpdateDialog = lazyComponent(
  () => import('./ProviderOfferingUserUpdateDialog'),
  'ProviderOfferingUserUpdateDialog',
);

export const ProviderOfferingUserUpdateButton: FC<{
  row: OfferingUser;
  provider?: ServiceProvider;
  offering?: any;
  refetch;
}> = (props) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const canUpdateOfferingUser = hasPermission(user, {
    permission: PermissionEnum.UPDATE_OFFERING_USER,
    customerId: props.provider
      ? props.provider.customer_uuid
      : props.offering
        ? props.offering.customer_uuid
        : undefined,
  });
  return (
    canUpdateOfferingUser && (
      <ActionItem
        title="Edit"
        action={() =>
          dispatch(
            openModalDialog(ProviderOfferingUserUpdateDialog, {
              resolve: props,
              size: 'lg',
            }),
          )
        }
        iconNode={<Pencil />}
      />
    )
  );
};
