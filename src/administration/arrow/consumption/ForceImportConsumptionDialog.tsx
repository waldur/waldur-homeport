import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import {
  adminArrowBillingSyncsSyncResourceHistoricalConsumption,
  Resource,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { defaultCurrency } from '@/core/formatCurrency';
import { SubmitButton } from '@/form';
import { AsyncPaginate } from '@/form/themed-select';
import { translate } from '@/i18n';
import { resourceAutocomplete } from '@/marketplace/common/autocompletes';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';
import { DASH_ESCAPE_CODE } from '@/table/constants';

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

  const loadResources = useCallback(
    (query: string, prevOptions, { page }) =>
      resourceAutocomplete(
        {
          name: query,
          field: ['name', 'url', 'uuid', 'backend_id', 'offering_name'],
        } as any,
        prevOptions,
        page,
      ),
    [],
  );

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
        error?.response?.data?.error ||
        error?.message ||
        translate('Failed to preview consumption data');
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
          } as any,
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
        error?.response?.data?.error ||
        error?.message ||
        translate('Failed to force import consumption data');
      showError(errorMessage);
    },
  });

  const renderFormPhase = () => (
    <>
      <p className="text-muted mb-4">
        {translate(
          'Force import consumption data from Arrow, including finalized periods. Select a resource and date range to preview.',
        )}
      </p>

      <Form.Group className="mb-3">
        <Form.Label>{translate('Resource')}</Form.Label>
        <AsyncPaginate
          placeholder={translate('Select resource...')}
          loadOptions={loadResources}
          getOptionValue={(option: Resource) => option.uuid}
          getOptionLabel={(option: Resource) =>
            `${option.name}${option.backend_id ? ` (${option.backend_id})` : ''}`
          }
          value={selectedResource}
          onChange={(value) => setSelectedResource(value as Resource)}
          noOptionsMessage={() => translate('No resources with backend ID')}
          isClearable
          additional={{ page: 1 }}
        />
        <Form.Text className="text-muted">
          {translate(
            'Only resources with an Arrow license reference are shown',
          )}
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>{translate('From period')}</Form.Label>
        <Form.Control
          type="month"
          value={periodFrom}
          onChange={(e) => setPeriodFrom(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>{translate('To period')}</Form.Label>
        <Form.Control
          type="month"
          value={periodTo}
          onChange={(e) => setPeriodTo(e.target.value)}
        />
      </Form.Group>
    </>
  );

  const renderPreviewPhase = () => (
    <>
      <p className="text-muted mb-3">
        {translate('Preview of consumption data from Arrow for {resource}.', {
          resource: selectedResource?.name,
        })}
      </p>

      {previewData.length === 0 ? (
        <Alert variant="info">
          {translate(
            'No consumption data found for the selected period range.',
          )}
        </Alert>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>{translate('Period')}</th>
                <th>{translate('Arrow Sell')}</th>
                <th>{translate('Current Sell')}</th>
                <th>{translate('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {previewData.map((item) => (
                <tr key={item.period}>
                  <td>{item.period}</td>
                  <td>{defaultCurrency(parseFloat(item.consumed_sell))}</td>
                  <td>
                    {item.has_existing
                      ? defaultCurrency(parseFloat(item.existing_consumed_sell))
                      : DASH_ESCAPE_CODE}
                  </td>
                  <td>
                    {item.has_existing ? (
                      <div className="d-flex flex-column gap-1">
                        {item.is_finalized ? (
                          <Badge variant="danger" pill outline>
                            {translate('Finalized — will overwrite')}
                          </Badge>
                        ) : (
                          <Badge variant="warning" pill outline>
                            {translate('Pending — will update')}
                          </Badge>
                        )}
                        {item.is_reconciled && (
                          <Badge variant="primary" pill outline>
                            {translate('Reconciled')}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Badge variant="success" pill outline>
                        {translate('New')}
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {previewMutation.data?.errors?.length > 0 && (
        <Alert variant="warning" className="mt-3">
          <strong>{translate('Some periods had errors:')}</strong>
          <ul className="mb-0 mt-2">
            {previewMutation.data.errors.map((err: any, idx: number) => (
              <li key={idx}>
                {err.period}: {err.error}
              </li>
            ))}
          </ul>
        </Alert>
      )}
    </>
  );

  const renderResultPhase = () => (
    <>
      {importMutation.isSuccess && importMutation.data && (
        <Alert
          variant={
            importMutation.data.periods_synced > 0 ? 'success' : 'warning'
          }
        >
          <strong>{translate('Force import completed')}</strong>
          <ul className="mb-0 mt-2">
            <li>
              {translate('Periods synced')}:{' '}
              {importMutation.data.periods_synced}
            </li>
            <li>
              {translate('Periods skipped')}:{' '}
              {importMutation.data.periods_skipped}
            </li>
            {importMutation.data.periods_no_data > 0 && (
              <li className="text-muted">
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
        </Alert>
      )}

      {importMutation.data?.errors?.length > 0 && (
        <Alert variant="warning" className="mt-3">
          <strong>{translate('Some periods had errors:')}</strong>
          <ul className="mb-0 mt-2">
            {importMutation.data.errors.map((err: any, idx: number) => (
              <li key={idx}>
                {err.period}: {err.error}
              </li>
            ))}
          </ul>
        </Alert>
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
            disabled={!selectedResource}
            label={translate('Preview')}
            onClick={() => previewMutation.mutate()}
          />
        </>
      );
    }
    if (phase === 'preview') {
      return (
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setPhase('form')}
            disabled={importMutation.isPending}
          >
            {translate('Back')}
          </button>
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
            <span className="fw-bold">{selectedResource.name}</span>
            {selectedResource.backend_id && (
              <>
                {' '}
                <span className="text-muted">
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
