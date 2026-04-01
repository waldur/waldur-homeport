import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { CompactEditButton } from '@waldur/form/CompactEditButton';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { useUser } from '@waldur/workspace/hooks';
import { getCustomer } from '@waldur/workspace/selectors';

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
