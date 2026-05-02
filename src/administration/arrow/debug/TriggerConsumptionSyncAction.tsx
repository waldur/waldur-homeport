import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { Card } from 'react-bootstrap';
import { adminArrowBillingSyncsTriggerConsumptionSync } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';

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
          pending={isTriggering}
        />
      </Card.Body>
    </Card>
  );
};
