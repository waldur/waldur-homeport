import { FC, useMemo } from 'react';
import {
  RequestTypeAdmin,
  supportRequestTypesAdminDestroy,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { RemovalActionButton } from '@/table/RemovalActionButton';

interface BatchDeleteActionProps {
  rows: RequestTypeAdmin[];
  refetch: () => void;
}

export const BatchDeleteAction: FC<BatchDeleteActionProps> = ({
  rows,
  refetch,
}) => {
  const syncedCount = useMemo(
    () => rows.filter((row) => row.is_synced).length,
    [rows],
  );

  const { mutate, isPending } = useBatchMutation<RequestTypeAdmin, void>({
    rows,
    refetch,
    mutationFn: (row) =>
      supportRequestTypesAdminDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Request types have been deleted successfully.'),
    renderPartialSuccessMessage: (n) =>
      translate('{n} request types have been deleted successfully.', { n }),
    errorMessage: translate('Unable to delete request types.'),
    renderErrorMessage: (n) =>
      translate('{n} request types could not be deleted.', { n }),
    confirmation: {
      title: translate('Delete request types'),
      body: (
        <div>
          <p>
            {syncedCount > 0
              ? translate(
                  'You are about to delete {count} request types. {syncedCount} of them are synced and may be re-created on the next sync.',
                  {
                    count: rows.length,
                    syncedCount,
                  },
                  formatJsxTemplate,
                )
              : translate(
                  'You are about to delete {count} request types.',
                  { count: rows.length },
                  formatJsxTemplate,
                )}
          </p>
          <ul>
            {rows.map((row) => (
              <li key={row.uuid}>
                {row.name} {row.is_synced && <em>({translate('synced')})</em>}
              </li>
            ))}
          </ul>
        </div>
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionButton
      title={translate('Delete')}
      action={mutate}
      disabled={isPending || !rows.length}
      disabledReason={
        !rows.length
          ? translate('No request types selected')
          : translate('Deletion in progress')
      }
    />
  );
};
