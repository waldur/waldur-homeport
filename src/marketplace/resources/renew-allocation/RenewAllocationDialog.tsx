import { FC, useCallback } from 'react';
import { marketplaceResourcesRenew, Resource } from 'waldur-js-client';

import { ProgressStep } from '@waldur/core/ProgressSteps';
import { WizardFinalFormContainer } from '@waldur/form/WizardFinalFormContainer';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { useNotify } from '@waldur/store/hooks';

import { Step1UpdateLimits } from './Step1UpdateLimits';
import { Step2ExtendDuration } from './Step2ExtendDuration';
import { Step3PurchaseOrder } from './Step3PurchaseOrder';
import { RenewAllocationFormData } from './types';

interface RenewAllocationDialog {
  resolve: {
    resources?: Array<Resource & { marketplace_resource_uuid? }>; // For multi selection
    resource?: Resource & { marketplace_resource_uuid? };
    refetch(): void;
  };
}

const WizardForms = [
  Step1UpdateLimits,
  Step2ExtendDuration,
  Step3PurchaseOrder,
];

const steps: ProgressStep[] = [
  {
    key: 'limits',
    label: translate('Update limits'),
    completed: false,
  },
  {
    key: 'duration',
    label: translate('Extend duration'),
    completed: false,
  },
  {
    key: 'purchase-order',
    label: translate('Purchase order'),
    completed: false,
  },
];

export const RenewAllocationDialog: FC<RenewAllocationDialog> = ({
  resolve,
}) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const isMulti = resolve.resources?.length > 1;
  const resources =
    resolve.resources || (resolve.resource ? [resolve.resource] : []);

  const onSubmit = useCallback(
    async (formData: RenewAllocationFormData) => {
      try {
        const promises = resources.map((resource) =>
          marketplaceResourcesRenew({
            path: { uuid: resource.marketplace_resource_uuid || resource.uuid },
            body: {
              extension_months: formData.extension_months,
              limits:
                formData[resource.marketplace_resource_uuid || resource.uuid]
                  .limits,
              request_comment: formData.purchase_order_reference,
            },
          }),
        );

        await Promise.allSettled(promises).then((results) => {
          const error = results.filter((res) => res.status === 'rejected');
          const success = results.filter((res) => res.status === 'fulfilled');

          if (success.length) {
            resolve.refetch();
            if (isMulti) {
              showSuccess(
                translate(
                  'Renewal request has been created for {n} resources.',
                  { n: success.length },
                ),
              );
            } else {
              showSuccess(translate('Renewal request has been created.'));
            }
          }
          if (error.length) {
            showErrorResponse(error[0].reason);
          } else {
            closeDialog();
          }
          return results;
        });
      } catch (e) {
        showErrorResponse(e, translate('Unable to send renewal request.'));
      }
    },
    [resolve, showSuccess, showErrorResponse, closeDialog],
  );

  const initialValues = {
    ...resources.reduce((acc, resource) => {
      acc[resource.uuid] = { limits: resource.limits };
      return acc;
    }, {}),
    extension_months: 1,
  };

  return (
    <WizardFinalFormContainer
      onSubmit={onSubmit}
      submitLabel={translate('Confirm')}
      steps={steps}
      wizardForms={WizardForms}
      title={
        isMulti
          ? translate('Renew selected allocations ({n})', {
              n: resources.length,
            })
          : translate('Renew allocation for {name}', {
              name: resources[0].name,
            })
      }
      subtitle={
        isMulti
          ? translate(
              'Choose renewal period and provide a purchase order for all selected resources.',
            )
          : translate(
              'Extend the allocation period and optionally provide a purchase order.',
            )
      }
      initialValues={initialValues}
      data={{ resources }}
      modalProps={{ bodyClassName: 'h-450px' }}
    />
  );
};
