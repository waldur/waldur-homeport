import { Trash } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

import { deleteOfferingUser } from '../common/api';
import { ServiceProvider } from '../types';

import { OfferingUser } from './types';

export const ProviderOfferingUserDeleteButton: FC<{
  row: OfferingUser;
  provider?: ServiceProvider;
  offering?: any;
  refetch;
}> = (props) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const canDeleteOfferingUser = hasPermission(user, {
    permission: PermissionEnum.DELETE_OFFERING_USER,
    customerId: props.provider
      ? props.provider.customer_uuid
      : props.offering
        ? props.offering.customer_uuid
        : undefined,
  });
  const handleDelete = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete offering user'),
        translate('Are you sure you want to delete offering user {username}?', {
          username: props.row.username,
        }),
      );
      await deleteOfferingUser(props.row.uuid);
      dispatch(showSuccess(translate('Offering user has been deleted.')));
      props.refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to delete offering user.')),
      );
    }
  };
  return (
    canDeleteOfferingUser && (
      <ActionItem
        title={translate('Delete')}
        iconNode={<Trash />}
        className="text-danger"
        action={handleDelete}
      />
    )
  );
};
