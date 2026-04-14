import { ArrowsClockwiseIcon, TrashIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Alert, Card, Col, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

import {
  useArrowSettings,
  useCleanupConsumption,
  useTriggerConsumptionSync,
} from '../api';

interface ArrowDebugPanelProps {
  settings?: { uuid: string } | null;
}

export const ArrowDebugPanel = ({ settings }: ArrowDebugPanelProps) => {
  const dispatch = useDispatch();
  const { data: currentSettings, isLoading } = useArrowSettings();
  const triggerConsumptionSync = useTriggerConsumptionSync();
  const cleanupConsumption = useCleanupConsumption();
  const [cleanupResult, setCleanupResult] = useState<any>(null);

  const activeSettings = settings ?? currentSettings;

  const handleTriggerConsumptionSync = async () => {
    try {
      // Get current year/month for sync
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      await triggerConsumptionSync.mutateAsync({
        year: currentYear,
        month: currentMonth,
      });
      dispatch(showSuccess(translate('Consumption sync triggered')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Failed to trigger consumption sync')),
      );
    }
  };

  const handleCleanupConsumption = async () => {
    try {
      const result = await cleanupConsumption.mutateAsync();
      setCleanupResult(result.data);
      dispatch(showSuccess(translate('Cleanup completed')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Failed to cleanup consumption')),
      );
    }
  };

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
              <Card className="h-100">
                <Card.Body>
                  <h6>{translate('Trigger Consumption Sync')}</h6>
                  <p className="text-muted small mb-3">
                    {translate(
                      'Manually trigger consumption data synchronization from Arrow.',
                    )}
                  </p>
                  <ActionButton
                    action={handleTriggerConsumptionSync}
                    title={translate('Sync consumption')}
                    iconNode={<ArrowsClockwiseIcon weight="bold" />}
                    variant="primary"
                    pending={triggerConsumptionSync.isPending}
                  />
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="h-100">
                <Card.Body>
                  <h6>{translate('Cleanup Consumption Data')}</h6>
                  <p className="text-muted small mb-3">
                    {translate('Remove orphaned or stale consumption records.')}
                  </p>
                  <ActionButton
                    action={handleCleanupConsumption}
                    title={translate('Cleanup')}
                    iconNode={<TrashIcon weight="bold" />}
                    variant="danger"
                    pending={cleanupConsumption.isPending}
                  />
                  {cleanupResult && (
                    <Alert variant="info" className="mt-3 mb-0">
                      <small>
                        {translate('Cleanup result:')}{' '}
                        {JSON.stringify(cleanupResult)}
                      </small>
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};
