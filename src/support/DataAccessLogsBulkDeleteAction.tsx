import {
  dataAccessLogsDestroy,
  GlobalUserDataAccessLog,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { formatJsxTemplate, translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { RemovalActionButton } from '@/table/RemovalActionButton';

interface DataAccessLogsBulkDeleteActionProps {
  rows: GlobalUserDataAccessLog[];
  refetch: () => void;
}

export const DataAccessLogsBulkDeleteAction = ({
  rows,
  refetch,
}: DataAccessLogsBulkDeleteActionProps) => {
  const { mutate, isPending } = useBatchMutation<GlobalUserDataAccessLog, void>(
    {
      rows,
      refetch,
      mutationFn: (row) => dataAccessLogsDestroy({ path: { uuid: row.uuid } }),
      successMessage: translate(
        '{count} data access log(s) have been deleted.',
        {
          count: rows.length,
        },
      ),
      renderPartialSuccessMessage: (n) =>
        translate('{n} data access log(s) have been deleted.', { n }),
      errorMessage: translate('Unable to delete data access logs.'),
      renderErrorMessage: (n) =>
        translate('Unable to delete {n} data access logs.', { n }),
      confirmation: {
        title: translate('Delete selected logs'),
        body: (
          <div>
            <p>
              {translate(
                'Are you sure you want to delete the following {count} data access log(s)?',
                { count: rows.length },
                formatJsxTemplate,
              )}
            </p>
            <ul>
              {rows.map((row) => (
                <li key={row.uuid}>
                  {row.user.full_name || row.user.username} -{' '}
                  {formatDateTime(row.timestamp)}
                </li>
              ))}
            </ul>
          </div>
        ),
        options: { forDeletion: true },
      },
    },
  );

  return (
    <RemovalActionButton
      title={translate('Delete')}
      action={mutate}
      disabled={isPending || rows.length === 0}
      disabledReason={
        rows.length === 0
          ? translate('No logs selected')
          : translate('Deletion in progress')
      }
      pending={isPending}
    />
  );
};
