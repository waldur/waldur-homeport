import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import {
  adminArrowBillingSyncsSyncResourceHistoricalConsumption,
  Resource,
} from 'waldur-js-client';

import {
  AlertItem,
  FormField,
  FormLabel,
  FormText,
  MonthPicker,
  parseDateValue,
  toIsoMonth,
} from 'waldur-ui';

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
          <span className="font-medium">{resource.name}</span>
          {resource.backend_id && (
            <>
              {' '}
              <span className="text-quaternary">({resource.backend_id})</span>
            </>
          )}
        </>
      }
      footer={
        <>
          <CloseDialogButton label={translate('Cancel')} />
          <SubmitButton
            submitting={mutation.isPending}
            disabled={!periodFrom || !periodTo || periodFrom > periodTo}
            label={translate('Sync')}
            onClick={() => mutation.mutate()}
          />
        </>
      }
    >
      <p className="text-quaternary mb-3">
        {translate(
          'Fetch historical consumption data from Arrow and create usage records for billing.',
        )}
      </p>

      <FormField className="mb-2.5">
        <FormLabel>{translate('From period')}</FormLabel>
        <MonthPicker
          value={parseDateValue(periodFrom)}
          onChange={(month) => setPeriodFrom(toIsoMonth(month))}
          maxDate={periodTo}
          // Required: the dialog seeds a range and the API needs both ends.
          clearable={false}
          disabled={mutation.isPending}
        />
        <FormText variant="muted">
          {translate('Start of the date range to sync')}
        </FormText>
      </FormField>

      <FormField className="mb-2.5">
        <FormLabel>{translate('To period')}</FormLabel>
        <MonthPicker
          value={parseDateValue(periodTo)}
          onChange={(month) => setPeriodTo(toIsoMonth(month))}
          minDate={periodFrom}
          // Required: the dialog seeds a range and the API needs both ends.
          clearable={false}
          disabled={mutation.isPending}
        />
        <FormText variant="muted">
          {translate('End of the date range to sync')}
        </FormText>
      </FormField>

      {mutation.isSuccess && mutation.data && (
        <AlertItem
          type="floating"
          variant="success"
          title={translate('Sync completed')}
          body={
            <ul className="mb-0 mt-1.5">
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
          }
        />
      )}

      {mutation.data?.errors?.length > 0 && (
        <AlertItem
          type="floating"
          variant="warning"
          className="mt-2.5"
          title={translate('Some periods had errors:')}
          body={
            <ul className="mb-0 mt-1.5">
              {mutation.data.errors.map((err: any, idx: number) => (
                <li key={idx}>
                  {err.period}: {err.error}
                </li>
              ))}
            </ul>
          }
        />
      )}
    </ModalDialog>
  );
};
