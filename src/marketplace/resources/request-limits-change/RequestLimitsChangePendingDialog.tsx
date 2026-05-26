import { FC } from 'react';
import {
  marketplaceResourceLimitChangeRequestsCancel,
  ResourceLimitChangeRequest,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';

interface Props {
  request: ResourceLimitChangeRequest;
  refetch?: () => void;
}

export const RequestLimitsChangePendingDialog: FC<Props> = ({
  request,
  refetch,
}) => {
  const cancelMutation = useManagedMutation({
    mutationFn: () =>
      marketplaceResourceLimitChangeRequestsCancel({
        path: { uuid: request.uuid },
        body: {} as any,
      }),
    successMessage: translate('Limit change request has been canceled.'),
    errorMessage: translate('Unable to cancel limit change request.'),
    refetch,
  });

  return (
    <ModalDialog
      title={translate('Request limit change')}
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
            pending={cancelMutation.isPending}
          />
        </>
      }
    >
      <p className="text-gray-700">
        {translate(
          'You already have a pending request to change limits for resource {name}.',
          { name: request.resource_name },
        )}
      </p>
    </ModalDialog>
  );
};
