import { Trash } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

import { deleteProjectCredit } from './api';

export const ProjectDeleteCreditButton = ({ row, refetch }) => {
  const customer = useSelector(getCustomer);
  const dispatch = useDispatch();

  const handleDeleteConfirmation = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete project credit'),
        translate(
          'Are you sure you want to delete the credit for {project} in {organization}? This will release the allocated credits back to the organization.',
          {
            project: <b>{row.project_name}</b>,
            organization: <b>{customer?.name}</b>,
          },
          formatJsxTemplate,
        ),
        true,
      );
    } catch {
      return;
    }
    try {
      await deleteProjectCredit(row.uuid);
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
      onClick={() => handleDeleteConfirmation()}
    >
      <span className="svg-icon svg-icon-2 svg-icon-danger">
        <Trash weight="bold" />
      </span>
      {translate('Delete')}
    </Dropdown.Item>
  );
};
