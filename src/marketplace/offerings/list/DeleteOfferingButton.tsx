import { Trash } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { deleteProviderOffering } from '../../common/api';

export const DeleteOfferingButton = ({ row, refetch }) => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);

  const canDeleteOffering = hasPermission(user, {
    permission: PermissionEnum.DELETE_OFFERING,
    customerId: row.customer_uuid || customer.uuid,
  });

  if (row.state != 'Draft' || row.resources_count || !canDeleteOffering) {
    return null;
  }

  const handleDeleteConfirmation = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete confirmation'),
        translate('Are you sure you want to delete this offering?'),
      );
    } catch {
      return;
    }
    try {
      await deleteProviderOffering(row.uuid);
      dispatch(showSuccess(translate('Offering deleted successfully.')));
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Error while deleting offering.')),
      );
      refetch();
    }
  };

  return (
    <Dropdown.Item
      as="button"
      className="text-danger"
      onClick={() => {
        handleDeleteConfirmation();
      }}
    >
      <span className="svg-icon svg-icon-2">
        <Trash />
      </span>
      {translate('Delete')}
    </Dropdown.Item>
  );
};
