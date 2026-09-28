import { FC } from 'react';
import {
  marketplaceResourceEndDateChangeRequestsCancel,
  ResourceEndDateChangeRequest,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface Props {
  request: ResourceEndDateChangeRequest;
  refetch?: () => void;
}

export const RequestEndDateChangePendingDialog: FC<Props> = ({
  request,
  refetch,
}) => {
  const cancelMutation = useManagedMutation({
    mutationFn: () =>
      marketplaceResourceEndDateChangeRequestsCancel({
        path: { uuid: request.uuid },
        body: {} as any,
      }),
    successMessage: translate('End date change request has been canceled.'),
    errorMessage: translate('Unable to cancel end date change request.'),
    refetch,
  });

  return (
    <ModalDialog
      title={translate('Request end date change')}
      footer={
        <>
          <CloseDialogButton />
          <BaseButton
            label={
              cancelMutation.isPending
                ? translate('Canceling...')
                : translate('Cancel request')
            }
            onClick={() => cancelMutation.mutate()}
            variant="danger"
            pending={cancelMutation.isPending}
            size="lg"
          />
        </>
      }
    >
      <p className="text-gray-700">
        {translate(
          'You already have a pending request to change the end date of resource {name} to {date}.',
          {
            name: request.resource_name,
            date: formatDate(request.requested_end_date),
          },
        )}
      </p>
    </ModalDialog>
  );
};
