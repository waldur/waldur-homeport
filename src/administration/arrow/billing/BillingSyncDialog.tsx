import { DateTime } from 'luxon';
import { useCallback, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Resource } from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { AsyncPaginate, Select } from '@waldur/form/themed-select';
import { PeriodOption } from '@waldur/form/types';
import { translate } from '@waldur/i18n';
import { resourceAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { useTriggerBillingSync, useTriggerReconciliation } from '../api';

interface BillingSyncDialogProps {
  resolve: {
    refetch?: () => void;
  };
}

interface PeriodChoice {
  label: string;
  value: PeriodOption;
}

const makePeriodOptions = (): PeriodChoice[] => {
  let date = DateTime.now().startOf('month');
  const choices: PeriodChoice[] = [];
  for (let i = 0; i < 24; i++) {
    choices.push({
      label: date.toFormat('MMMM, yyyy'),
      value: { year: date.year, month: date.month, current: i === 0 },
    });
    date = date.minus({ months: 1 });
  }
  return choices;
};

export const BillingSyncDialog = ({ resolve }: BillingSyncDialogProps) => {
  const { refetch } = resolve;
  const dispatch = useDispatch();

  const periodOptions = useMemo(() => makePeriodOptions(), []);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodChoice>(
    periodOptions[0],
  );
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );

  const triggerSync = useTriggerBillingSync();
  const triggerReconciliation = useTriggerReconciliation();

  const loadResources = useCallback(
    (query: string, prevOptions, { page }) =>
      resourceAutocomplete(
        {
          name: query,
          field: ['name', 'url', 'uuid', 'backend_id'],
        } as any,
        prevOptions,
        page,
      ),
    [],
  );

  const handleSync = async () => {
    try {
      const { year, month } = selectedPeriod.value;
      await triggerSync.mutateAsync({
        year,
        month,
        ...(selectedResource ? { resource_uuid: selectedResource.uuid } : {}),
      } as any);
      dispatch(showSuccess(translate('Billing sync triggered')));
      refetch?.();
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Failed to trigger sync')));
    }
  };

  const handleReconcile = async () => {
    try {
      const { year, month } = selectedPeriod.value;
      await triggerReconciliation.mutateAsync({ year, month });
      dispatch(showSuccess(translate('Reconciliation triggered')));
      refetch?.();
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Failed to trigger reconciliation')),
      );
    }
  };

  const isPending = triggerSync.isPending || triggerReconciliation.isPending;

  return (
    <ModalDialog
      title={translate('Sync billing')}
      footer={
        <>
          <CloseDialogButton label={translate('Cancel')} />
          <SubmitButton
            submitting={triggerReconciliation.isPending}
            disabled={isPending}
            label={translate('Reconcile')}
            onClick={handleReconcile}
            className="btn btn-secondary"
          />
          <SubmitButton
            submitting={triggerSync.isPending}
            disabled={isPending}
            label={translate('Sync billing')}
            onClick={handleSync}
          />
        </>
      }
    >
      <Form.Group className="mb-3">
        <Form.Label>{translate('Period')}</Form.Label>
        <Select
          placeholder={translate('Select billing period')}
          value={selectedPeriod}
          onChange={(option: PeriodChoice) => setSelectedPeriod(option)}
          options={periodOptions}
          isClearable={false}
          isDisabled={isPending}
          className="metronic-select-container"
          classNamePrefix="metronic-select"
        />
        <Form.Text className="text-muted">
          {translate('Select the billing period to sync')}
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>{translate('Resource (optional)')}</Form.Label>
        <AsyncPaginate
          placeholder={translate('All resources')}
          loadOptions={loadResources}
          getOptionValue={(option: Resource) => option.uuid}
          getOptionLabel={(option: Resource) =>
            `${option.name}${option.backend_id ? ` (${option.backend_id})` : ''}`
          }
          value={selectedResource}
          onChange={(value) => setSelectedResource(value as Resource)}
          noOptionsMessage={() => translate('No resources found')}
          isClearable
          isDisabled={isPending}
          additional={{ page: 1 }}
        />
        <Form.Text className="text-muted">
          {translate(
            'Leave empty to sync all resources. Select a resource to sync only its billing lines.',
          )}
        </Form.Text>
      </Form.Group>
    </ModalDialog>
  );
};
