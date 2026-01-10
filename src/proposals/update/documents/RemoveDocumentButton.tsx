import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { proposalProtectedCallsDetachDocuments } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const RemoveDocumentAction = ({ row, call, refetch }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      if (row.uuid) {
        try {
          await waitForConfirmation(
            dispatch,
            translate('Confirmation'),
            translate(
              'Are you sure you want to remove {document} document from {call}?',
              {
                document: row.file_name
                  .split('/')
                  .pop()
                  .replace(/_[^_]+\./, '.'),
                call: call.name,
              },
            ),
            { forDeletion: true },
          );
        } catch {
          return;
        }
        await proposalProtectedCallsDetachDocuments({
          path: { uuid: call.uuid },
          body: { documents: [row.uuid] },
        });
      }
      dispatch(showSuccess(translate('Documents have been removed.')));
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate(
            'An error occurred while removing documents. Please try again.',
          ),
        ),
      );
    }
  };
  return (
    <ActionItem
      action={callback}
      title={translate('Remove')}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
    />
  );
};
