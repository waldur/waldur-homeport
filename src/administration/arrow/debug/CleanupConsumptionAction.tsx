import { adminArrowBillingSyncsCleanupConsumption } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

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
    <div className="card h-full">
      <div className="card-body">
        <h6>{translate('Cleanup Consumption Data')}</h6>
        <p className="text-quaternary small mb-2.5">
          {translate('Remove orphaned or stale consumption records.')}
        </p>
        <RemovalActionButton
          action={handleCleanupConsumption}
          title={translate('Cleanup')}
          pending={isCleaning}
        />
        {cleanupData && (
          <AlertItem
            type="floating"
            variant="info"
            className="mt-2.5 mb-0"
            title={
              <small>
                {translate('Cleanup result:')}{' '}
                {JSON.stringify(cleanupData.data)}
              </small>
            }
          />
        )}
      </div>
    </div>
  );
};
