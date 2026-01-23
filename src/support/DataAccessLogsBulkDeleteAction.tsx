import { TrashIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import {
  dataAccessLogsDestroy,
  GlobalUserDataAccessLog,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

interface DataAccessLogsBulkDeleteActionProps {
  rows: GlobalUserDataAccessLog[];
  refetch: () => void;
}

export const DataAccessLogsBulkDeleteAction = ({
  rows,
  refetch,
}: DataAccessLogsBulkDeleteActionProps) => {
  const dispatch = useDispatch();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const rowsList = rows.map((row) => (
        <li key={row.uuid}>
          {row.user.full_name || row.user.username} -{' '}
          {formatDateTime(row.timestamp)}
        </li>
      ));

      const confirmationMessage = (
        <div>
          <p>
            {translate(
              'Are you sure you want to delete the following {count} data access log(s)?',
              { count: rows.length },
              formatJsxTemplate,
            )}
          </p>
          <ul>{rowsList}</ul>
        </div>
      );

      try {
        await waitForConfirmation(
          dispatch,
          translate('Delete selected logs'),
          confirmationMessage,
          { forDeletion: true },
        );
      } catch {
        return;
      }

      try {
        const promises = rows.map((row) =>
          dataAccessLogsDestroy({ path: { uuid: row.uuid } }),
        );
        await Promise.all(promises);
        refetch();
        dispatch(
          showSuccess(
            translate('{count} data access log(s) have been deleted.', {
              count: rows.length,
            }),
          ),
        );
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to delete data access logs.'),
          ),
        );
      }
    },
  });

  return (
    <ActionButton
      title={translate('Delete')}
      action={mutate}
      iconNode={<TrashIcon weight="bold" />}
      variant="danger"
      disabled={isPending || rows.length === 0}
      pending={isPending}
    />
  );
};
