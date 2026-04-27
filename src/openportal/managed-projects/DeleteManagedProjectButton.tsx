import { TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncFn } from 'react-use';
import { openportalManagedProjectsDeleteDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';

export const DeleteManagedProjectButton: FC<{ row; refetch }> = ({
  row,
  refetch,
}) => {
  const project = row; // Assuming row is the project object

  if (!project) {
    return null;
  }

  const dispatch = useDispatch();

  const action = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete managed project'),
        translate(
          'Are you sure you would like to delete this managed project?',
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      await openportalManagedProjectsDeleteDestroy({
        path: {
          identifier: project.identifier,
          destination: project.destination,
        },
      });
      await refetch();
      dispatch(showSuccess(translate('Managed project has been deleted.')));
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to delete this managed project.'),
        ),
      );
    }
  };

  const [{ loading }, callback] = useAsyncFn(action);

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
