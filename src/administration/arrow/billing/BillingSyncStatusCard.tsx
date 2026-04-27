import { Card, Col, Row } from 'react-bootstrap';

import { Badge } from '@/core/Badge';
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
        <Card.Body className="text-center py-6">
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
        <Row>
          <Col md={3}>
            <div className="text-muted small mb-1">
              {translate('Sync Status')}
            </div>
            <Badge
              variant={settings.sync_enabled ? 'success' : 'warning'}
              pill
              outline
            >
              {settings.sync_enabled
                ? translate('Enabled')
                : translate('Paused')}
            </Badge>
          </Col>
          <Col md={3}>
            <div className="text-muted small mb-1">
              {translate('Pending Records')}
            </div>
            <span className="fw-bold">
              {renderFieldOrDash((status as any)?.pending_count)}
            </span>
          </Col>
          <Col md={3}>
            <div className="text-muted small mb-1">
              {translate('Synced Records')}
            </div>
            <span className="fw-bold">
              {renderFieldOrDash((status as any)?.synced_count)}
            </span>
          </Col>
          <Col md={3}>
            <div className="text-muted small mb-1">
              {translate('Failed Records')}
            </div>
            <span className="fw-bold text-danger">
              {renderFieldOrDash((status as any)?.failed_count)}
            </span>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
