import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { deleteCostPolicy } from './api';

export const CostPolicyDeleteButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the cost policy for project {name}?',
          { name: <strong>{row.project_name}</strong> },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    deleteCostPolicy(row.uuid).then(() => {
      refetch();
    });
  };
  return (
    <ActionButton
      title={translate('Remove')}
      action={openDialog}
      variant="light-danger"
      icon="fa fa-trash"
    />
  );
};
