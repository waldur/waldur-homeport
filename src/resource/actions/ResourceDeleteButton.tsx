import { TrashIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncFn } from 'react-use';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { ActionItem } from './ActionItem';

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
        { forDeletion: true },
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
    <ActionItem
      title={translate('Delete')}
      disabled={loading}
      action={callback}
      iconNode={<TrashIcon weight="bold" />}
      size="sm"
      className="text-danger"
      iconColor="danger"
    />
  );
};
