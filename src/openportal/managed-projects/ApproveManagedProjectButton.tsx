import { CheckCircleIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { openportalManagedProjectsApprove } from 'waldur-js-client';

import { LoadingSpinnerSimple } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { wrapTooltip } from '@waldur/table/ActionButton';

export const ApproveManagedProjectButton = ({
  row,
  as,
  className,
  refetch,
}) => {
  const project = row; // Assuming row is the project object

  if (!project) {
    return null;
  }

  const dispatch = useDispatch();
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      try {
        await openportalManagedProjectsApprove({
          path: {
            identifier: project.identifier,
            destination: project.destination,
          },
        });
        if (refetch) {
          await refetch();
        }
        dispatch(showSuccess(translate('Project has been approved.')));
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to approve project.')),
        );
      }
    },
  });

  return wrapTooltip(
    translate('Click to approve this project.'),
    <>
      {isLoading ? (
        <LoadingSpinnerSimple className="me-1" />
      ) : (
        <ActionItem
          as={as}
          className={classNames(className, 'w-100')}
          title={translate('Approve')}
          action={mutate}
          disabled={isLoading}
          iconNode={<CheckCircleIcon weight="bold" />}
          size="sm"
        />
      )}
    </>,
  );
};
