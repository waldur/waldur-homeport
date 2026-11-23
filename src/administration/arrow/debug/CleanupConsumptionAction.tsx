import { TrashIcon } from '@phosphor-icons/react';

import { BaseButton, Card, CardContent } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const CleanupConsumptionWizard = lazyComponent(() =>
  import('./CleanupConsumptionWizard').then((module) => ({
    default: module.CleanupConsumptionWizard,
  })),
);

export const CleanupConsumptionAction = () => {
  const { openDialog } = useModal();

  return (
    <Card className="h-full">
      <CardContent>
        <h6>{translate('Cleanup Consumption Data')}</h6>
        <p className="text-quaternary small mb-2.5">
          {translate(
            'Delete consumption records for chosen months or a resource, after a preview, so the next sync fetches them again. Months on an issued invoice or settled by an import are kept.',
          )}
        </p>
        <BaseButton
          variant="secondary"
          label={translate('Clean up')}
          iconNode={<TrashIcon weight="bold" />}
          onClick={() => openDialog(CleanupConsumptionWizard, { size: 'lg' })}
          size="lg"
        />
      </CardContent>
    </Card>
  );
};
