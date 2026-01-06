import { Trash } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { useNotify } from '@waldur/store/hooks';

import { deleteRequestType, RequestTypeAdmin } from './api';

export const RequestTypeDeleteAction = ({
  row,
  refetch,
}: {
  row: RequestTypeAdmin;
  refetch: () => void;
}) => {
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse } = useNotify();

  const handleDelete = async () => {
    try {
      const message = row.is_synced
        ? translate(
            'Are you sure you want to delete {name}? This is a synced request type and may be re-created on the next sync.',
            { name: <strong>{row.name}</strong> },
            formatJsxTemplate,
          )
        : translate(
            'Are you sure you want to delete {name}?',
            { name: <strong>{row.name}</strong> },
            formatJsxTemplate,
          );

      await waitForConfirmation(
        dispatch,
        translate('Delete request type'),
        message,
        { forDeletion: true },
      );
    } catch {
      return;
    }

    try {
      await deleteRequestType(row.uuid);
      showSuccess(translate('Request type has been deleted.'));
      refetch();
    } catch (error) {
      showErrorResponse(error, translate('Unable to delete request type.'));
    }
  };

  return (
    <ActionItem
      title={translate('Delete')}
      iconNode={<Trash />}
      action={handleDelete}
      className="text-danger"
    />
  );
};
