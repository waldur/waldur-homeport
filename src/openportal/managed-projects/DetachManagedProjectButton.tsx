import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncFn } from 'react-use';
import { openportalManagedProjectsDetach } from 'waldur-js-client';

import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';

export const DetachManagedProjectButton: FC<{ row; refetch }> = ({
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
        translate('Detach the existing project from this managed project'),
        translate('Are you sure you would like to detach this project?'),
      );
    } catch {
      return;
    }
    try {
      await openportalManagedProjectsDetach({
        path: {
          identifier: project.identifier,
          destination: project.destination,
        },
      });
      await refetch();
      dispatch(showSuccess(translate('Project has been detached.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to detach this project.')),
      );
    }
  };

  const [{ loading }, callback] = useAsyncFn(action);

  return (
    <ActionItem
      title={translate('Detach Project')}
      disabled={loading}
      action={callback}
      size="sm"
      className="text-danger"
      iconColor="danger"
      iconNode={<WarningCircleIcon weight="bold" />}
    />
  );
};
