import { Trash } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { deleteBroadcastTemplate } from '@waldur/broadcasts/api';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

export const BroadcastTemplateDeleteButton = ({ template, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the template {template_name}?',
          {
            template_name: <strong>{template.name}</strong>,
          },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    await deleteBroadcastTemplate(template.uuid);
    await refetch();
  };
  return (
    <RowActionButton
      title={translate('Remove')}
      action={openDialog}
      variant="outline-danger"
      iconNode={<Trash />}
      size="sm"
    />
  );
};
