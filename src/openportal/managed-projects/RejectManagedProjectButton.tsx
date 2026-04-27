import { XCircleIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { openportalManagedProjectsReject } from 'waldur-js-client';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { wrapTooltip } from '@/table/ActionButton';

export const RejectManagedProjectButton = ({ row, as, className, refetch }) => {
  const project = row; // Assuming row is the project object

  if (!project) {
    return null;
  }

  const dispatch = useDispatch();
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Reject managed project request'),
          translate(
            'Are you sure you want to reject this managed project request?',
          ),
        );
      } catch {
        return;
      }
      try {
        await openportalManagedProjectsReject({
          path: {
            identifier: project.identifier,
            destination: project.destination,
          },
        });
        if (refetch) {
          await refetch();
        }
        dispatch(showSuccess(translate('Project has been rejected.')));
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to reject project.')),
        );
      }
    },
  });
  return wrapTooltip(
    translate('Click to reject this project.'),
    <>
      {isLoading ? (
        <LoadingSpinnerSimple className="me-1" />
      ) : (
        <ActionItem
          as={as}
          className={classNames(className, 'w-100')}
          title={translate('Reject')}
          action={mutate}
          disabled={isLoading}
          iconNode={<XCircleIcon weight="bold" />}
          size="sm"
        />
      )}
    </>,
  );
};
