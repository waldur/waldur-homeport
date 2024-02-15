import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { detachDocuments } from '@waldur/proposals/update/documents/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

export const RemoveDocumentButton = (props) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      if (props.fileUuid) {
        await detachDocuments(props.call, props.fileUuid);
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
    <ActionButton
      action={callback}
      title={translate('Remove')}
      icon="fa fa-trash"
      className="btn btn-sm btn-danger"
    />
  );
};
