import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncFn } from 'react-use';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

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
    <ActionButton
      title={translate('Delete')}
      disabled={loading}
      action={callback}
      icon={loading ? 'fa fa-spinner fa-spin me-1' : 'fa fa-trash'}
    />
  );
};
