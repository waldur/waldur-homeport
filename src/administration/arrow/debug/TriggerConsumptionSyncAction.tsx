import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { adminArrowBillingSyncsTriggerConsumptionSync } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { arrowQueryKeys } from '../api';

const useTriggerConsumptionSync = () => {
  return useManagedMutation<any, any, void>({
    mutationFn: () => {
      const now = new Date();
      return adminArrowBillingSyncsTriggerConsumptionSync({
        body: {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        },
      });
    },
    invalidateQueries: [{ queryKey: arrowQueryKeys.consumptionRecords() }],
    successMessage: translate('Consumption sync triggered'),
    errorMessage: translate('Failed to trigger consumption sync'),
  });
};

export const TriggerConsumptionSyncAction = () => {
  const { mutate: handleTriggerConsumptionSync, isPending: isTriggering } =
    useTriggerConsumptionSync();

  return (
    <div className="card h-full">
      <div className="card-body">
        <h6>{translate('Trigger Consumption Sync')}</h6>
        <p className="text-quaternary small mb-2.5">
          {translate(
            'Manually trigger consumption data synchronization from Arrow.',
          )}
        </p>
        <BaseButton
          onClick={handleTriggerConsumptionSync}
          label={translate('Sync consumption')}
          iconNode={<ArrowsClockwiseIcon weight="bold" />}
          variant="primary"
          pending={isTriggering}
          size="lg"
        />
      </div>
    </div>
  );
};
