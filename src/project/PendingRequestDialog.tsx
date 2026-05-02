import { FC } from 'react';
import {
  ProjectEndDateChangeRequest,
  projectEndDateChangeRequestsCancel,
} from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';

interface PendingRequestDialogProps {
  request: ProjectEndDateChangeRequest;
  refetch: () => void;
}

export const PendingRequestDialog: FC<PendingRequestDialogProps> = ({
  request,
  refetch,
}) => {
  const cancelMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      projectEndDateChangeRequestsCancel({
        path: { uuid: request.uuid },
      }),
    successMessage: translate(
      'Project end date change request has been canceled.',
    ),
    errorMessage: translate('Unable to cancel request.'),
    refetch,
    invalidateQueries: [
      {
        queryKey: ['project-end-date-change-requests'],
      },
    ],
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to cancel the request?'),
    },
  });

  return (
    <ModalDialog
      title={translate('Change end date')}
      footer={
        <>
          <CloseDialogButton />
          <ActionButton
            title={
              cancelMutation.isPending
                ? translate('Canceling...')
                : translate('Cancel request')
            }
            action={() => cancelMutation.mutate()}
            variant="danger"
            disabled={cancelMutation.isPending}
            disabledReason={translate('The request is being processed')}
            pending={cancelMutation.isPending}
          />
        </>
      }
    >
      <p className="text-gray-700">
        {translate(
          'You already have a pending request to change the project end date.',
        )}
      </p>
      {request.requested_end_date && (
        <p className="text-gray-700 mt-2">
          {translate('Requested end date')}:{' '}
          {formatDate(request.requested_end_date)}
        </p>
      )}
    </ModalDialog>
  );
};
