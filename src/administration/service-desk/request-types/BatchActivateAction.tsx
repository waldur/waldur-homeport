import { CheckCircleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import {
  RequestTypeAdmin,
  RequestTypeAdminRequest,
  supportRequestTypesAdminActivate,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { ActionButton } from '@/table/ActionButton';

interface BatchActivateActionProps {
  rows: RequestTypeAdmin[];
  refetch: () => void;
}

export const BatchActivateAction: FC<BatchActivateActionProps> = ({
  rows,
  refetch,
}) => {
  const inactiveRows = useMemo(
    () => rows.filter((row) => !row.is_active),
    [rows],
  );
  const { mutate, isPending } = useBatchMutation<RequestTypeAdmin, void>({
    rows: inactiveRows,
    refetch,
    mutationFn: (row) =>
      supportRequestTypesAdminActivate({
        path: { uuid: row.uuid },
        body: {} as RequestTypeAdminRequest,
      }),
    successMessage: translate(
      'Request types have been activated successfully.',
    ),
    renderPartialSuccessMessage: (n) =>
      translate('{n} request types have been activated successfully.', { n }),
    errorMessage: translate('Unable to activate request types.'),
    renderErrorMessage: (n) =>
      translate('{n} request types could not be activated.', { n }),
    confirmation: {
      title: translate('Activate request types'),
      body: (
        <div>
          <p>{translate('You are about to activate these request types:')}</p>
          <ul>
            {inactiveRows.map((row) => (
              <li key={row.uuid}>{row.name}</li>
            ))}
          </ul>
        </div>
      ),
    },
  });

  return (
    <ActionButton
      title={translate('Activate')}
      action={mutate}
      iconNode={<CheckCircleIcon weight="bold" />}
      variant="primary"
      disabled={isPending || !inactiveRows.length}
      disabledReason={
        !inactiveRows.length
          ? translate('No inactive request types selected')
          : translate('Operation in progress')
      }
    />
  );
};
