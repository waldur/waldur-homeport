import { Alert, Card, Col, Row } from 'react-bootstrap';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { useArrowSettings } from '../api';

import { CleanupConsumptionAction } from './CleanupConsumptionAction';
import { TriggerConsumptionSyncAction } from './TriggerConsumptionSyncAction';

interface ArrowDebugPanelProps {
  settings?: { uuid: string } | null;
}

export const ArrowDebugPanel = ({ settings }: ArrowDebugPanelProps) => {
  const { data: currentSettings, isLoading } = useArrowSettings();

  const activeSettings = settings ?? currentSettings;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!activeSettings) {
    return (
      <Alert variant="info">
        {translate('Arrow integration not configured')}
      </Alert>
    );
  }

  return (
    <div className="d-flex flex-column gap-6">
      <Card>
        <Card.Header>
          <Card.Title>
            <h5 className="mb-0">{translate('Debug Actions')}</h5>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <Alert variant="warning" className="mb-4">
            {translate(
              'These actions are for debugging purposes only. Use with caution.',
            )}
          </Alert>

          <Row className="g-4">
            <Col md={6}>
              <TriggerConsumptionSyncAction />
            </Col>

            <Col md={6}>
              <CleanupConsumptionAction />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};
