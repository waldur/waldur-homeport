import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { proposalProtectedCallsResourceTemplatesDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';

export const ResourceTemplateDeleteButton = ({ row, refetch, call }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the resource template {name}?',
          { name: <strong>{row.name}</strong> },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }

    try {
      await proposalProtectedCallsResourceTemplatesDestroy({
        path: { obj_uuid: row.uuid, uuid: call.uuid },
      });
      dispatch(showSuccess(translate('Resource template deleted')));
      refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to delete resource template.')),
      );
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
