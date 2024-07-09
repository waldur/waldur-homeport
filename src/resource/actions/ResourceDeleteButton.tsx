import { Trash } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncFn } from 'react-use';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

export const ResourceDeleteButton: FunctionComponent<{
  apiFunction;
  resourceType;
  refetch?;
}> = ({ apiFunction, resourceType, refetch }) => {
  const dispatch = useDispatch();
  const deleteApp = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to delete this {resourceType}?', {
          resourceType,
        }),
      );
    } catch {
      return;
    }
    try {
      await apiFunction();
      dispatch(
        showSuccess(
          translate('{resourceType} has been deleted.', { resourceType }),
        ),
      );
      if (refetch) {
        refetch();
      }
    } catch (response) {
      dispatch(
        showErrorResponse(
          response,
          translate('Unable to delete {resourceType}.', { resourceType }),
        ),
      );
    }
  };
  const [{ loading }, callback] = useAsyncFn(deleteApp);
  return (
    <RowActionButton
      variant="light-danger"
      title={translate('Delete')}
      pending={loading}
      action={callback}
      iconNode={<Trash />}
      size="sm"
    />
  );
};
