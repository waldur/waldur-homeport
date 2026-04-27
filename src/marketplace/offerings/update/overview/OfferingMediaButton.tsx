import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { openModalDialog } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';
import { getCustomer } from '@/workspace/selectors';

import { ACTIVE, DRAFT, PAUSED } from '../../store/constants';

import { MediaType } from './types';

const UpdateOfferingMediaDialog = lazyComponent(() =>
  import('../../actions/UpdateOfferingMediaDialog').then((module) => ({
    default: module.UpdateOfferingMediaDialog,
  })),
);

export const OfferingMediaButton: FC<{
  offering: ProviderOfferingDetails;
  refetch: () => void;
  mediaType: MediaType;
}> = (props) => {
  const user = useUser();
  const customer = useSelector(getCustomer);
  const dispatch = useDispatch();

  const callback = () =>
    dispatch(
      openModalDialog(UpdateOfferingMediaDialog, {
        resolve: {
          offering: props.offering,
          refetch: props.refetch,
          mediaType: props.mediaType,
        },
      }),
    );

  if (
    user.is_staff ||
    ([DRAFT, ACTIVE, PAUSED].includes(props.offering.state) &&
      hasPermission(user, {
        permission: PermissionEnum.UPDATE_OFFERING_THUMBNAIL,
        customerId: customer.uuid,
      }))
  )
    return <CompactEditButton onClick={callback} variant="secondary" />;
  return null;
};
