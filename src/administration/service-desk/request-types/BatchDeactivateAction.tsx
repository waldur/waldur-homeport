import { XCircleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import {
  RequestTypeAdmin,
  supportRequestTypesAdminDeactivate,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { ActionButton } from '@/table/ActionButton';

interface BatchDeactivateActionProps {
  rows: RequestTypeAdmin[];
  refetch: () => void;
}

export const BatchDeactivateAction: FC<BatchDeactivateActionProps> = ({
  rows,
  refetch,
}) => {
  const activeRows = useMemo(() => rows.filter((row) => row.is_active), [rows]);
  const { mutate, isPending } = useBatchMutation<RequestTypeAdmin, void>({
    rows: activeRows,
    refetch,
    mutationFn: (row) =>
      supportRequestTypesAdminDeactivate({ path: { uuid: row.uuid } }),
    successMessage: translate(
      'Request types have been deactivated successfully.',
    ),
    renderPartialSuccessMessage: (n) =>
      translate('{n} request types have been deactivated successfully.', { n }),
    errorMessage: translate('Unable to deactivate request types.'),
    renderErrorMessage: (n) =>
      translate('{n} request types could not be deactivated.', { n }),
    confirmation: {
      title: translate('Deactivate request types'),
      body: (
        <div>
          <p>{translate('You are about to deactivate these request types:')}</p>
          <ul>
            {activeRows.map((row) => (
              <li key={row.uuid}>{row.name}</li>
            ))}
          </ul>
        </div>
      ),
    },
  });

  return (
    <ActionButton
      title={translate('Deactivate')}
      action={mutate}
      iconNode={<XCircleIcon weight="bold" />}
      variant="warning"
      disabled={isPending || !activeRows.length}
      disabledReason={
        !activeRows.length
          ? translate('No active request types selected')
          : translate('Operation in progress')
      }
    />
  );
};
