import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import {
  adminArrowBillingSyncsSyncResourceHistoricalConsumption,
  Resource,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

interface SyncConsumptionHistoryDialogProps {
  resolve: {
    resource: Resource;
    refetch?: () => void;
  };
}

const getDefaultDateRange = () => {
  const today = new Date();
  const endDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  // Default to 12 months ago
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - 11);
  const start = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;

  return { start, end: endDate };
};

export const SyncConsumptionHistoryDialog = ({
  resolve,
}: SyncConsumptionHistoryDialogProps) => {
  const { resource, refetch } = resolve;
  const { showError, showSuccess } = useNotify();

  const { closeDialog } = useModal();

  const defaultRange = getDefaultDateRange();
  const [periodFrom, setPeriodFrom] = useState(defaultRange.start);
  const [periodTo, setPeriodTo] = useState(defaultRange.end);

  const mutation = useMutation({
    mutationFn: async () => {
      const response =
        await adminArrowBillingSyncsSyncResourceHistoricalConsumption({
          body: {
            resource_uuid: resource.uuid,
            period_from: periodFrom,
            period_to: periodTo,
          },
        });
      return response.data;
    },
    onSuccess: (data) => {
      const message = translate(
        'Synced {synced} period(s), skipped {skipped} (already finalized)',
        {
          synced: data.periods_synced,
          skipped: data.periods_skipped,
        },
      );
      showSuccess(message);
      refetch?.();
      closeDialog();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        translate('Failed to sync consumption history');
      showError(errorMessage);
    },
  });

  return (
    <ModalDialog
      title={translate('Sync consumption history')}
      subtitle={
        <>
          <span className="fw-bold">{resource.name}</span>
          {resource.backend_id && (
            <>
              {' '}
              <span className="text-muted">({resource.backend_id})</span>
            </>
          )}
        </>
      }
      footer={
        <>
          <CloseDialogButton label={translate('Cancel')} />
          <SubmitButton
            submitting={mutation.isPending}
            label={translate('Sync')}
            onClick={() => mutation.mutate()}
          />
        </>
      }
    >
      <p className="text-muted mb-4">
        {translate(
          'Fetch historical consumption data from Arrow and create usage records for billing.',
        )}
      </p>

      <Form.Group className="mb-3">
        <Form.Label>{translate('From period')}</Form.Label>
        <Form.Control
          type="month"
          value={periodFrom}
          onChange={(e) => setPeriodFrom(e.target.value)}
          disabled={mutation.isPending}
        />
        <Form.Text className="text-muted">
          {translate('Start of the date range to sync')}
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>{translate('To period')}</Form.Label>
        <Form.Control
          type="month"
          value={periodTo}
          onChange={(e) => setPeriodTo(e.target.value)}
          disabled={mutation.isPending}
        />
        <Form.Text className="text-muted">
          {translate('End of the date range to sync')}
        </Form.Text>
      </Form.Group>

      {mutation.isSuccess && mutation.data && (
        <Alert variant="success">
          <strong>{translate('Sync completed')}</strong>
          <ul className="mb-0 mt-2">
            <li>
              {translate('Periods synced')}: {mutation.data.periods_synced}
            </li>
            <li>
              {translate('Periods skipped (finalized)')}:{' '}
              {mutation.data.periods_skipped}
            </li>
            {mutation.data.errors?.length > 0 && (
              <li className="text-danger">
                {translate('Errors')}: {mutation.data.errors.length}
              </li>
            )}
          </ul>
        </Alert>
      )}

      {mutation.data?.errors?.length > 0 && (
        <Alert variant="warning" className="mt-3">
          <strong>{translate('Some periods had errors:')}</strong>
          <ul className="mb-0 mt-2">
            {mutation.data.errors.map((err: any, idx: number) => (
              <li key={idx}>
                {err.period}: {err.error}
              </li>
            ))}
          </ul>
        </Alert>
      )}
    </ModalDialog>
  );
};
