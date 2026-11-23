import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { adminArrowBillingSyncsCleanupConsumption } from 'waldur-js-client';

import { AlertItem, BaseButton, Card, CardContent } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

// Only the dry run is offered: deleting consumption records leaves their
// invoice items in place, and the next sync would bill them again.
const useCleanupPreview = () =>
  useManagedMutation<any, any, void>({
    mutationFn: () =>
      adminArrowBillingSyncsCleanupConsumption({ body: { dry_run: true } }),
    errorMessage: translate('Failed to preview the consumption cleanup'),
  });

export const CleanupConsumptionAction = () => {
  const { mutate, isPending, data } = useCleanupPreview();
  const result = data?.data;

  return (
    <Card className="h-full">
      <CardContent>
        <h6>{translate('Cleanup Consumption Data')}</h6>
        <p className="text-quaternary small mb-2.5">
          {translate(
            'Counts every consumption record a cleanup without filters would remove, except months already billed on an issued invoice or settled by an import. Nothing is deleted.',
          )}
        </p>
        <BaseButton
          variant="secondary"
          label={translate('Preview cleanup')}
          iconNode={<MagnifyingGlassIcon weight="bold" />}
          pending={isPending}
          onClick={() => mutate()}
          size="lg"
        />
        {result && (
          <AlertItem
            type="floating"
            variant="info"
            className="mt-2.5 mb-0"
            title={translate(
              'Dry run: {records} consumption records would be removed ({items} invoice items, {compensations} compensation items affected).',
              {
                records: result.records_to_delete,
                items: result.invoice_items_affected,
                compensations: result.compensation_items_affected,
              },
            )}
          />
        )}
      </CardContent>
    </Card>
  );
};
