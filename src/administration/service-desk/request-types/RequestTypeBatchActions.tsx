import { CheckCircle, Trash, XCircle } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

import {
  activateRequestType,
  deactivateRequestType,
  deleteRequestType,
  RequestTypeAdmin,
} from './api';

interface RequestTypeBatchActionsProps {
  rows: RequestTypeAdmin[];
  refetch: () => void;
}

export const RequestTypeBatchActions: FC<RequestTypeBatchActionsProps> = ({
  rows,
  refetch,
}) => {
  const dispatch = useDispatch();

  // Batch activate
  const activateMutation = useMutation({
    mutationFn: async () => {
      const inactiveRows = rows.filter((row) => !row.is_active);
      if (!inactiveRows.length) return;

      try {
        const rowsList = inactiveRows.map((row) => (
          <li key={row.uuid}>{row.name}</li>
        ));

        await waitForConfirmation(
          dispatch,
          translate('Activate request types'),
          <div>
            <p>{translate('You are about to activate these request types:')}</p>
            <ul>{rowsList}</ul>
          </div>,
        );
      } catch {
        return;
      }

      try {
        const promises = inactiveRows.map((row) =>
          activateRequestType(row.uuid),
        );
        await Promise.all(promises);
        refetch();
        dispatch(
          showSuccess(
            translate('Request types have been activated successfully.'),
          ),
        );
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to activate request types.'),
          ),
        );
      }
    },
  });

  // Batch deactivate
  const deactivateMutation = useMutation({
    mutationFn: async () => {
      const activeRows = rows.filter((row) => row.is_active);
      if (!activeRows.length) return;

      try {
        const rowsList = activeRows.map((row) => (
          <li key={row.uuid}>{row.name}</li>
        ));

        await waitForConfirmation(
          dispatch,
          translate('Deactivate request types'),
          <div>
            <p>
              {translate('You are about to deactivate these request types:')}
            </p>
            <ul>{rowsList}</ul>
          </div>,
        );
      } catch {
        return;
      }

      try {
        const promises = activeRows.map((row) =>
          deactivateRequestType(row.uuid),
        );
        await Promise.all(promises);
        refetch();
        dispatch(
          showSuccess(
            translate('Request types have been deactivated successfully.'),
          ),
        );
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to deactivate request types.'),
          ),
        );
      }
    },
  });

  // Batch delete
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!rows.length) return;

      const syncedCount = rows.filter((row) => row.is_synced).length;
      try {
        const rowsList = rows.map((row) => (
          <li key={row.uuid}>
            {row.name} {row.is_synced && <em>({translate('synced')})</em>}
          </li>
        ));

        const message =
          syncedCount > 0
            ? translate(
                'You are about to delete {count} request types. {syncedCount} of them are synced and may be re-created on the next sync.',
                { count: rows.length, syncedCount },
                formatJsxTemplate,
              )
            : translate(
                'You are about to delete {count} request types.',
                { count: rows.length },
                formatJsxTemplate,
              );

        await waitForConfirmation(
          dispatch,
          translate('Delete request types'),
          <div>
            <p>{message}</p>
            <ul>{rowsList}</ul>
          </div>,
          { forDeletion: true },
        );
      } catch {
        return;
      }

      try {
        const promises = rows.map((row) => deleteRequestType(row.uuid));
        await Promise.all(promises);
        refetch();
        dispatch(
          showSuccess(
            translate('Request types have been deleted successfully.'),
          ),
        );
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to delete request types.'),
          ),
        );
      }
    },
  });

  const inactiveCount = rows.filter((row) => !row.is_active).length;
  const activeCount = rows.filter((row) => row.is_active).length;

  return (
    <>
      <ActionButton
        title={translate('Activate')}
        action={() => activateMutation.mutate()}
        iconNode={<CheckCircle weight="bold" />}
        variant="primary"
        disabled={activateMutation.isPending || !inactiveCount}
        tooltip={
          !inactiveCount
            ? translate('No inactive request types selected.')
            : undefined
        }
      />
      <ActionButton
        title={translate('Deactivate')}
        action={() => deactivateMutation.mutate()}
        iconNode={<XCircle weight="bold" />}
        variant="warning"
        disabled={deactivateMutation.isPending || !activeCount}
        tooltip={
          !activeCount
            ? translate('No active request types selected.')
            : undefined
        }
      />
      <ActionButton
        title={translate('Delete')}
        action={() => deleteMutation.mutate()}
        iconNode={<Trash weight="bold" />}
        variant="danger"
        disabled={deleteMutation.isPending || !rows.length}
      />
    </>
  );
};
