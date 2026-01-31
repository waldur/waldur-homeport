import type { Resource, ArrowConsumptionRecord } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

import { useResourceConsumptionHistory } from '../api';

interface ViewConsumptionHistoryDialogProps {
  resolve: {
    resource: Resource;
  };
}

export const ViewConsumptionHistoryDialog = ({
  resolve,
}: ViewConsumptionHistoryDialogProps) => {
  const { resource } = resolve;
  const { data, isLoading, error } = useResourceConsumptionHistory(
    resource.uuid,
  );

  return (
    <ModalDialog
      title={translate('Consumption history')}
      subtitle={
        <>
          <span className="fw-bold">{resource.name}</span>
          {resource.backend_id && (
            <>
              {' '}
              <code className="text-muted">({resource.backend_id})</code>
            </>
          )}
        </>
      }
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-danger">{translate('Failed to load data')}</div>
      ) : !data || data.length === 0 ? (
        <div className="text-muted">
          {translate('No consumption records found for this resource.')}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>{translate('Period')}</th>
                <th>{translate('Consumed (Sell)')}</th>
                <th>{translate('Final (Sell)')}</th>
                <th>{translate('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record: ArrowConsumptionRecord) => (
                <tr key={record.uuid}>
                  <td>{record.billing_period}</td>
                  <td>{defaultCurrency(record.consumed_sell)}</td>
                  <td>
                    {record.final_sell
                      ? defaultCurrency(record.final_sell)
                      : DASH_ESCAPE_CODE}
                  </td>
                  <td>
                    <div className="d-flex flex-column gap-1">
                      <Badge
                        variant={record.is_finalized ? 'success' : 'warning'}
                        pill
                        outline
                      >
                        {record.is_finalized
                          ? translate('Finalized')
                          : translate('Pending')}
                      </Badge>
                      {record.is_reconciled && (
                        <Badge variant="primary" pill outline>
                          {translate('Reconciled')}
                        </Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ModalDialog>
  );
};
