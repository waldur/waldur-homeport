import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { autoprovisioningRulesDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const RuleDeleteButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the rule {name}?',
          { name: <strong>{row.name}</strong> },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }

    try {
      await autoprovisioningRulesDestroy({
        path: { uuid: row.uuid },
      });
      dispatch(showSuccess(translate('Rule deleted')));
      refetch();
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to delete rule.')));
    }
  };

  return (
    <ActionItem
      title={translate('Delete')}
      action={openDialog}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};
