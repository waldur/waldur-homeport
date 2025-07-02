import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { lexisLinksDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
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
        { forDeletion: true },
      );
    } catch {
      return;
    }
    await lexisLinksDestroy({ path: { uuid: row.uuid } });
    refetch();
  };
  return (
    <RowActionButton
      title={translate('Remove')}
      action={openDialog}
      variant="light-danger"
      iconNode={<TrashIcon />}
      size="sm"
    />
  );
};
