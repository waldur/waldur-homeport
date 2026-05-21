import { DateTime } from 'luxon';
import { useCallback, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import {
  Resource,
  adminArrowBillingSyncsTriggerSync,
  adminArrowBillingSyncsTriggerReconciliation,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { AsyncPaginate, Select } from '@/form/themed-select';
import { PeriodOption } from '@/form/types';
import { translate } from '@/i18n';
import { resourceAutocomplete } from '@/marketplace/common/autocompletes';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { arrowQueryKeys } from '../api';

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

  const periodOptions = useMemo(() => makePeriodOptions(), []);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodChoice>(
    periodOptions[0],
  );
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );

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

  const syncMutation = useManagedMutation<any, any, void>({
    mutationFn: () => {
      const { year, month } = selectedPeriod.value;
      return adminArrowBillingSyncsTriggerSync({
        body: {
          year,
          month,
          ...(selectedResource ? { resource_uuid: selectedResource.uuid } : {}),
        },
      });
    },

    successMessage: translate('Billing sync triggered'),
    errorMessage: translate('Failed to trigger sync'),
    refetch,

    invalidateQueries: [
      {
        queryKey: arrowQueryKeys.billingSyncs(),
      },
    ],
  });

  const reconcileMutation = useManagedMutation<any, any, void>({
    mutationFn: () => {
      const { year, month } = selectedPeriod.value;
      return adminArrowBillingSyncsTriggerReconciliation({
        body: { year, month },
      });
    },

    successMessage: translate('Reconciliation triggered'),
    errorMessage: translate('Failed to trigger reconciliation'),
    refetch,

    invalidateQueries: [
      {
        queryKey: arrowQueryKeys.billingSyncs(),
      },
    ],
  });

  const isPending = syncMutation.isPending || reconcileMutation.isPending;

  return (
    <ModalDialog
      title={translate('Sync billing')}
      footer={
        <>
          <CloseDialogButton label={translate('Cancel')} />
          <SubmitButton
            submitting={reconcileMutation.isPending}
            disabled={isPending}
            label={translate('Reconcile')}
            onClick={() => reconcileMutation.mutate()}
            className="btn btn-secondary"
          />
          <SubmitButton
            submitting={syncMutation.isPending}
            disabled={isPending}
            label={translate('Sync billing')}
            onClick={() => syncMutation.mutate()}
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
