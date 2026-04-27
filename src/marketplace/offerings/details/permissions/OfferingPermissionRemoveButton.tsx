import { TrashIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { marketplaceProviderOfferingsDeleteUser } from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { useUser } from '@/workspace/hooks';
import { getCustomer } from '@/workspace/selectors';

interface OfferingPermissionRemoveButtonProps {
  row: any;
  refetch;
}

export const OfferingPermissionRemoveButton: React.FC<
  OfferingPermissionRemoveButtonProps
> = (props) => {
  const user = useUser();
  const customer = useSelector(getCustomer);
  const canDeletePermission = hasPermission(user, {
    permission: PermissionEnum.DELETE_OFFERING_PERMISSION,
    customerId: customer.uuid,
  });

  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to revoke this permission?'),
      );
    } catch {
      return;
    }
    try {
      await marketplaceProviderOfferingsDeleteUser({
        path: { uuid: props.row.offering_uuid },
        body: {
          user: props.row.user_uuid,
          role: props.row.role_name,
        },
      });
      dispatch(showSuccess(translate('Permission has been revoked.')));
      await props.refetch();
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to revoke permission.')));
    }
  };
  return canDeletePermission ? (
    <ActionItem
      action={callback}
      title={translate('Revoke')}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
    />
  ) : null;
};
