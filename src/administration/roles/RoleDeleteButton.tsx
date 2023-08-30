import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { deleteRole } from './api';

export const RoleDeleteButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the role {name}?',
          { name: <strong>{row.name}</strong> },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    deleteRole(row.uuid).then(() => {
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
