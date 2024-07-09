import { Trash } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { deleteLexisLink } from '@waldur/marketplace/common/api';
import { waitForConfirmation } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

export const LexisLinkDeleteButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the LEXIS link of {resource_name}?',
          {
            resource_name: <strong>{row.resource_name}</strong>,
          },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    deleteLexisLink(row.url).then(() => {
      refetch();
    });
  };
  return (
    <RowActionButton
      title={translate('Remove')}
      action={openDialog}
      variant="light-danger"
      iconNode={<Trash />}
      size="sm"
    />
  );
};
