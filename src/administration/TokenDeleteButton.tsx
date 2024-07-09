import { Trash } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

import { deleteToken } from './api';

export const TokenDeleteButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the token of {firstname} {lastname}?',
          {
            firstname: <strong>{row.user_first_name}</strong>,
            lastname: <strong>{row.user_last_name}</strong>,
          },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    deleteToken(row.url).then(() => {
      refetch();
    });
  };
  return (
    <RowActionButton
      title={translate('Remove')}
      action={openDialog}
      iconNode={<Trash />}
      size="sm"
    />
  );
};
