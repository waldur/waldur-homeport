import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import {
  projectEndDateChangeRequestsCancel,
  ProjectEndDateChangeRequest,
} from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/hooks';
import { ActionButton } from '@/table/ActionButton';

interface PendingRequestDialogProps {
  request: ProjectEndDateChangeRequest;
  refetch: () => void;
}

export const PendingRequestDialog: FC<PendingRequestDialogProps> = ({
  request,
  refetch,
}) => {
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse } = useNotify();
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: () =>
      projectEndDateChangeRequestsCancel({
        path: { uuid: request.uuid },
      }),
    onSuccess: () => {
      showSuccess(
        translate('Project end date change request has been canceled.'),
      );
      dispatch(closeModalDialog());
      refetch();
      queryClient.invalidateQueries({
        queryKey: ['project-end-date-change-requests'],
      });
    },
    onError: (error) => {
      showErrorResponse(error);
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
