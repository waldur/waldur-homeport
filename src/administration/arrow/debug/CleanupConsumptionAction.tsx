import { Alert, Card } from 'react-bootstrap';
import { adminArrowBillingSyncsCleanupConsumption } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionButton } from '@/table/RemovalActionButton';

import { arrowQueryKeys } from '../api';

const useCleanupConsumption = () => {
  return useManagedMutation<any, any, void>({
    mutationFn: () => adminArrowBillingSyncsCleanupConsumption(),
    invalidateQueries: [
      { queryKey: arrowQueryKeys.consumptionRecords() },
      { queryKey: arrowQueryKeys.billingSyncs() },
    ],
    successMessage: translate('Cleanup completed'),
    errorMessage: translate('Failed to cleanup consumption'),
  });
};

export const CleanupConsumptionAction = () => {
  const {
    mutate: handleCleanupConsumption,
    isPending: isCleaning,
    data: cleanupData,
  } = useCleanupConsumption();

  return (
    <Card className="h-100">
      <Card.Body>
        <h6>{translate('Cleanup Consumption Data')}</h6>
        <p className="text-muted small mb-3">
          {translate('Remove orphaned or stale consumption records.')}
        </p>
        <RemovalActionButton
          action={handleCleanupConsumption}
          title={translate('Cleanup')}
          pending={isCleaning}
        />
        {cleanupData && (
          <Alert variant="info" className="mt-3 mb-0">
            <small>
              {translate('Cleanup result:')} {JSON.stringify(cleanupData.data)}
            </small>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};
