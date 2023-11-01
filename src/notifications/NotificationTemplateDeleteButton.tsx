import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { deleteNotificationTemplate } from '@waldur/notifications/api';
import { ActionButton } from '@waldur/table/ActionButton';

export const NotificationTemplateDeleteButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the template {template_name}?',
          {
            template_name: <strong>{row.name}</strong>,
          },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    deleteNotificationTemplate(row.uuid).then(() => {
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
