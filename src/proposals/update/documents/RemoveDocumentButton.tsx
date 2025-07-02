import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { proposalProtectedCallsDetachDocuments } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

export const RemoveDocumentButton = (props) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      if (props.file.uuid) {
        try {
          await waitForConfirmation(
            dispatch,
            translate('Confirmation'),
            translate(
              'Are you sure you want to remove {document} document from {call}?',
              {
                document: props.file.file_name
                  .split('/')
                  .pop()
                  .replace(/_[^_]+\./, '.'),
                call: props.call.name,
              },
            ),
            { forDeletion: true },
          );
        } catch {
          return;
        }
        await proposalProtectedCallsDetachDocuments({
          path: { uuid: props.call.uuid },
          body: { documents: [props.file.uuid] },
        });
      }
      dispatch(showSuccess(translate('Documents have been removed.')));
      props.refetch();
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
    <RowActionButton
      action={callback}
      title={translate('Remove')}
      iconNode={<TrashIcon />}
      variant="danger"
      size="sm"
    />
  );
};
