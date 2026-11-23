import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import {
  adminArrowBillingSyncsSyncResourceHistoricalConsumption,
  Resource,
} from 'waldur-js-client';

import {
  AlertItem,
  Badge,
  BaseButton,
  FormField,
  FormLabel,
  FormText,
  MonthPicker,
  parseDateValue,
  toIsoMonth,
} from 'waldur-ui';

import { format } from '@/core/ErrorMessageFormatter';
import { defaultCurrency } from '@/core/formatCurrency';
import { LoadingErred } from '@/core/LoadingErred';
import { SubmitButton } from '@/form';
import { AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';
import { resourceAutocomplete } from '@/marketplace/common/autocompletes';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { SimpleTable } from '@/table/SimpleTable';

import { useArrowSettings, useActiveVendorOfferingMappings } from '../api';

type Phase = 'form' | 'preview' | 'result';

interface PreviewPeriod {
  period: string;
  consumed_sell: string;
  consumed_buy: string;
  has_existing: boolean;
  existing_consumed_sell: string | null;
  is_finalized: boolean;
  is_reconciled: boolean;
}

const PreviewTable = ({ periods }: { periods: PreviewPeriod[] }) => (
  <SimpleTable<PreviewPeriod>
    columns={[
      {
        title: translate('Period'),
        render: ({ row }) => <>{row.period}</>,
      },
      {
        title: translate('Arrow Sell'),
        render: ({ row }) => (
          <>{defaultCurrency(parseFloat(row.consumed_sell))}</>
        ),
      },
      {
        title: translate('Current Sell'),
        render: ({ row }) => (
          <>
            {row.has_existing
              ? defaultCurrency(parseFloat(row.existing_consumed_sell))
              : DASH_ESCAPE_CODE}
          </>
        ),
      },
      {
        title: translate('Status'),
        render: ({ row }) =>
          row.has_existing ? (
            <div className="flex flex-col gap-1">
              {row.is_finalized ? (
                <Badge variant="danger" shape="pill" tone="outline">
                  {translate('Finalized — will overwrite')}
                </Badge>
              ) : (
                <Badge variant="warning" shape="pill" tone="outline">
                  {translate('Pending — will update')}
                </Badge>
              )}
              {row.is_reconciled && (
                <Badge variant="primary" shape="pill" tone="outline">
                  {translate('Reconciled')}
                </Badge>
              )}
            </div>
          ) : (
            <Badge variant="success" shape="pill" tone="outline">
              {translate('New')}
            </Badge>
          ),
      },
    ]}
    rows={periods}
    rowKey="period"
  />
);

interface ForceImportConsumptionDialogProps {
  resolve: {
    refetch?: () => void;
  };
}

const getDefaultDateRange = () => {
  const today = new Date();
  const endDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - 11);
  const start = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;

  return { start, end: endDate };
};

export const ForceImportConsumptionDialog = ({
  resolve,
}: ForceImportConsumptionDialogProps) => {
  const { refetch } = resolve;
  const { showError, showSuccess } = useNotify();

  const defaultRange = getDefaultDateRange();
  const [phase, setPhase] = useState<Phase>('form');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );
  const [periodFrom, setPeriodFrom] = useState(defaultRange.start);
  const [periodTo, setPeriodTo] = useState(defaultRange.end);
  const [previewData, setPreviewData] = useState<PreviewPeriod[]>([]);

  const settingsQuery = useArrowSettings();
  const settings = settingsQuery.data;
  const mappingsQuery = useActiveVendorOfferingMappings(settings?.uuid);
  const vendorMappings = mappingsQuery.data;
  const isLoadingOfferings =
    settingsQuery.isLoading || (Boolean(settings) && mappingsQuery.isLoading);
  const offeringsError = settingsQuery.error || mappingsQuery.error;

  // Only resources of offerings that an Arrow vendor is mapped to can have
  // Arrow consumption.
  const mappedOfferingUuids = useMemo(
    () =>
      Array.from(new Set((vendorMappings ?? []).map((m) => m.offering_uuid))),
    [vendorMappings],
  );

  const loadResources = useMemo(
    () =>
      resourceAutocomplete({
        field: [
          'name',
          'url',
          'uuid',
          'backend_id',
          'offering_name',
          'offering_uuid',
        ],
        // The backend reads one comma-separated value; repeated params would
        // keep only the last offering.
        offering_uuid: [mappedOfferingUuids.join(',')],
      }),
    [mappedOfferingUuids],
  );

  // Drop a picked resource whose offering is no longer mapped, but only while
  // picking: preview and import act on the resource already chosen.
  const offeringsKey = mappedOfferingUuids.join(',');
  useEffect(() => {
    if (
      phase === 'form' &&
      selectedResource &&
      !mappedOfferingUuids.includes(selectedResource.offering_uuid)
    ) {
      setSelectedResource(null);
    }
  }, [phase, selectedResource, mappedOfferingUuids]);

  const previewMutation = useMutation({
    mutationFn: async () => {
      const response =
        await adminArrowBillingSyncsSyncResourceHistoricalConsumption({
          body: {
            resource_uuid: selectedResource.uuid,
            period_from: periodFrom,
            period_to: periodTo,
            dry_run: true,
            force: true,
          },
        });
      return response.data as any;
    },
    onSuccess: (data) => {
      setPreviewData(data.preview_periods || []);
      setPhase('preview');
    },
    onError: (error: any) => {
      const errorMessage =
        format(error) || translate('Failed to preview consumption data');
      showError(errorMessage);
    },
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const response =
        await adminArrowBillingSyncsSyncResourceHistoricalConsumption({
          body: {
            resource_uuid: selectedResource.uuid,
            period_from: periodFrom,
            period_to: periodTo,
            force: true,
          },
        });
      return response.data as any;
    },
    onSuccess: (data) => {
      const message = data.periods_no_data
        ? translate(
            'Force imported {synced} period(s), {noData} with no data',
            {
              synced: data.periods_synced,
              noData: data.periods_no_data,
            },
          )
        : translate('Force imported {synced} period(s), skipped {skipped}', {
            synced: data.periods_synced,
            skipped: data.periods_skipped,
          });
      showSuccess(message);
      refetch?.();
      setPhase('result');
    },
    onError: (error: any) => {
      const errorMessage =
        format(error) || translate('Failed to force import consumption data');
      showError(errorMessage);
    },
  });

  const renderFormPhase = () => (
    <>
      <p className="text-quaternary mb-3">
        {translate(
          'Force import consumption data from Arrow, including finalized periods. Select a resource and date range to preview.',
        )}
      </p>

      {offeringsError ? (
        <LoadingErred
          message={translate('Failed to load Arrow offering mappings')}
          loadData={() =>
            settings ? mappingsQuery.refetch() : settingsQuery.refetch()
          }
        />
      ) : isLoadingOfferings ? null : !settings ? (
        <AlertItem
          type="floating"
          variant="warning"
          className="mb-2.5"
          title={translate('Arrow settings not configured')}
        />
      ) : mappedOfferingUuids.length === 0 ? (
        <AlertItem
          type="floating"
          variant="warning"
          className="mb-2.5"
          title={translate(
            'No offerings are mapped to Arrow vendors. Map a vendor to an offering first.',
          )}
        />
      ) : null}

      <FormField className="mb-2.5">
        <FormLabel>{translate('Resource')}</FormLabel>
        <AsyncSelect
          key={offeringsKey}
          isDisabled={
            isLoadingOfferings ||
            Boolean(offeringsError) ||
            mappedOfferingUuids.length === 0
          }
          isLoading={isLoadingOfferings}
          placeholder={translate('Select resource...')}
          loadOptions={loadResources}
          getOptionValue={(option: Resource) => option.uuid}
          getOptionLabel={(option: Resource) =>
            `${option.name}${option.backend_id ? ` (${option.backend_id})` : ''}`
          }
          value={selectedResource}
          onChange={(value) => setSelectedResource(value as Resource)}
          noOptionsMessage={() => translate('No resources found')}
          isClearable
        />
        <FormText variant="muted">
          {translate(
            'Only resources of offerings mapped to an Arrow vendor are shown',
          )}
        </FormText>
      </FormField>

      <FormField className="mb-2.5">
        <FormLabel>{translate('From period')}</FormLabel>
        <MonthPicker
          value={parseDateValue(periodFrom)}
          onChange={(month) => setPeriodFrom(toIsoMonth(month))}
          maxDate={periodTo}
          // Required: the dialog seeds a range and the API needs both ends.
          clearable={false}
        />
      </FormField>

      <FormField className="mb-2.5">
        <FormLabel>{translate('To period')}</FormLabel>
        <MonthPicker
          value={parseDateValue(periodTo)}
          onChange={(month) => setPeriodTo(toIsoMonth(month))}
          minDate={periodFrom}
          // Required: the dialog seeds a range and the API needs both ends.
          clearable={false}
        />
      </FormField>
    </>
  );

  const renderPreviewPhase = () => (
    <>
      <p className="text-quaternary mb-2.5">
        {translate('Preview of consumption data from Arrow for {resource}.', {
          resource: selectedResource?.name,
        })}
      </p>

      {previewData.length === 0 ? (
        <AlertItem
          type="floating"
          variant="info"
          title={translate(
            'No consumption data found for the selected period range.',
          )}
        />
      ) : (
        <PreviewTable periods={previewData} />
      )}

      {previewMutation.data?.errors?.length > 0 && (
        <AlertItem
          type="floating"
          variant="warning"
          className="mt-2.5"
          title={translate('Some periods had errors:')}
          body={
            <ul className="mb-0 mt-1.5">
              {previewMutation.data.errors.map((err: any, idx: number) => (
                <li key={idx}>
                  {err.period}: {err.error}
                </li>
              ))}
            </ul>
          }
        />
      )}
    </>
  );

  const renderResultPhase = () => (
    <>
      {importMutation.isSuccess && importMutation.data && (
        <AlertItem
          type="floating"
          variant={
            importMutation.data.periods_synced > 0 ? 'success' : 'warning'
          }
          title={translate('Force import completed')}
          body={
            <ul className="mb-0 mt-1.5">
              <li>
                {translate('Periods synced')}:{' '}
                {importMutation.data.periods_synced}
              </li>
              <li>
                {translate('Periods skipped')}:{' '}
                {importMutation.data.periods_skipped}
              </li>
              {importMutation.data.periods_no_data > 0 && (
                <li className="text-quaternary">
                  {translate('Periods with no data')}:{' '}
                  {importMutation.data.periods_no_data}
                </li>
              )}
              {importMutation.data.errors?.length > 0 && (
                <li className="text-danger">
                  {translate('Errors')}: {importMutation.data.errors.length}
                </li>
              )}
            </ul>
          }
        />
      )}

      {importMutation.data?.errors?.length > 0 && (
        <AlertItem
          type="floating"
          variant="warning"
          className="mt-2.5"
          title={translate('Some periods had errors:')}
          body={
            <ul className="mb-0 mt-1.5">
              {importMutation.data.errors.map((err: any, idx: number) => (
                <li key={idx}>
                  {err.period}: {err.error}
                </li>
              ))}
            </ul>
          }
        />
      )}
    </>
  );

  const renderFooter = () => {
    if (phase === 'form') {
      return (
        <>
          <CloseDialogButton label={translate('Cancel')} />
          <SubmitButton
            submitting={previewMutation.isPending}
            disabled={
              !selectedResource ||
              !periodFrom ||
              !periodTo ||
              periodFrom > periodTo
            }
            label={translate('Preview')}
            onClick={() => previewMutation.mutate()}
          />
        </>
      );
    }
    if (phase === 'preview') {
      return (
        <>
          <BaseButton
            variant="secondary"
            onClick={() => setPhase('form')}
            disabled={importMutation.isPending}
            disabledReason={translate('Import is already in progress')}
            label={translate('Back')}
          />
          <CloseDialogButton label={translate('Cancel')} />
          <SubmitButton
            submitting={importMutation.isPending}
            disabled={previewData.length === 0}
            label={translate('Force import')}
            onClick={() => importMutation.mutate()}
          />
        </>
      );
    }
    return <CloseDialogButton label={translate('Close')} />;
  };

  return (
    <ModalDialog
      title={translate('Force import consumption')}
      subtitle={
        selectedResource && (
          <>
            <span className="font-medium">{selectedResource.name}</span>
            {selectedResource.backend_id && (
              <>
                {' '}
                <span className="text-quaternary">
                  ({selectedResource.backend_id})
                </span>
              </>
            )}
          </>
        )
      }
      footer={renderFooter()}
    >
      {phase === 'form' && renderFormPhase()}
      {phase === 'preview' && renderPreviewPhase()}
      {phase === 'result' && renderResultPhase()}
    </ModalDialog>
  );
};
