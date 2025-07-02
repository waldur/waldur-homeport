import { TrashIcon } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { customerCreditsDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const DeleteCreditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();

  const handleDeleteConfirmation = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete confirmation'),
        translate('Are you sure you want to delete this credit?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      await customerCreditsDestroy({ path: { uuid: row.uuid } });
      refetch();
      dispatch(showSuccess(translate('Credit deleted successfully.')));
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Error while deleting credit.')),
      );
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
      <span className="svg-icon svg-icon-2 svg-icon-danger">
        <TrashIcon weight="bold" />
      </span>
      {translate('Delete')}
    </Dropdown.Item>
  );
};
