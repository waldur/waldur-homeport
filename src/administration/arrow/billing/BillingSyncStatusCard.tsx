import { Card } from 'react-bootstrap';

import { Badge } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

import { useArrowConsumptionStatus, useArrowSettings } from '../api';

export const BillingSyncStatusCard = () => {
  const { data: settings, isLoading: settingsLoading } = useArrowSettings();
  const { data: status, isLoading: statusLoading } =
    useArrowConsumptionStatus();

  if (settingsLoading || statusLoading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <LoadingSpinner />
        </Card.Body>
      </Card>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <Card>
      <Card.Body>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-5">
          <div>
            <div className="text-quaternary small mb-1">
              {translate('Sync Status')}
            </div>
            <Badge
              variant={settings.sync_enabled ? 'success' : 'warning'}
              shape="pill"
              tone="outline"
            >
              {settings.sync_enabled
                ? translate('Enabled')
                : translate('Paused')}
            </Badge>
          </div>
          <div>
            <div className="text-quaternary small mb-1">
              {translate('Pending Records')}
            </div>
            <span className="font-medium">
              {renderFieldOrDash((status as any)?.pending_count)}
            </span>
          </div>
          <div>
            <div className="text-quaternary small mb-1">
              {translate('Synced Records')}
            </div>
            <span className="font-medium">
              {renderFieldOrDash((status as any)?.synced_count)}
            </span>
          </div>
          <div>
            <div className="text-quaternary small mb-1">
              {translate('Failed Records')}
            </div>
            <span className="font-medium text-danger">
              {renderFieldOrDash((status as any)?.failed_count)}
            </span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
