import { FC } from 'react';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser, useCustomer } from '@/workspace/hooks';

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
  const customer = useCustomer();
  const { openDialog } = useModal();

  const callback = () =>
    openDialog(UpdateOfferingMediaDialog, {
      resolve: {
        offering: props.offering,
        refetch: props.refetch,
        mediaType: props.mediaType,
      },
    });

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
