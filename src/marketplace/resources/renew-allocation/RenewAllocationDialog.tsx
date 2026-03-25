import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FC, useCallback, useMemo } from 'react';
import {
  marketplaceResourcesRenew,
  marketplaceResourcesRetrieve,
  Resource,
} from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ProgressStep } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';
import { getFormLimitSerializer } from '@waldur/marketplace/common/registry';
import { useModal } from '@waldur/modal/hooks';
import { useNotify } from '@waldur/store/hooks';
import { Wizard } from '@waldur/wizard';

import { Step1UpdateLimits } from './Step1UpdateLimits';
import { Step2ExtendDuration } from './Step2ExtendDuration';
import { Step3PurchaseOrder } from './Step3PurchaseOrder';
import { RenewAllocationFormData } from './types';

interface RenewAllocationDialogProps {
  resolve: {
    resources?: Array<Resource>; // For multi selection
    resource?: Resource;
    resource_uuid?: string; // Fetch resource by UUID if resource not provided
    refetch?(): void;
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

export const RenewAllocationDialog: FC<RenewAllocationDialogProps> = ({
  resolve,
}) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();
  const router = useRouter();

  // Fetch resource by UUID if only UUID is provided
  const shouldFetch =
    !resolve.resource && !resolve.resources?.length && resolve.resource_uuid;

  const {
    data: fetchedResource,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['renew-resource', resolve.resource_uuid],
    queryFn: () =>
      marketplaceResourcesRetrieve({
        path: { uuid: resolve.resource_uuid },
      }).then((response) => response.data),
    enabled: Boolean(shouldFetch),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const resources = useMemo(() => {
    if (resolve.resources?.length) {
      return resolve.resources;
    }
    if (resolve.resource) {
      return [resolve.resource];
    }
    if (fetchedResource) {
      return [fetchedResource];
    }
    return [];
  }, [resolve.resources, resolve.resource, fetchedResource]);

  const isMulti = resources.length > 1;

  const onSubmit = useCallback(
    async (formData: RenewAllocationFormData) => {
      try {
        const promises = resources.map((resource) => {
          // Serialize limits (e.g., convert GB back to MB) based on offering type
          const limitSerializer = getFormLimitSerializer(
            resource.offering_type || '',
          );
          const serializedLimits = limitSerializer(
            formData[resource.uuid]?.limits || {},
          );

          return marketplaceResourcesRenew({
            path: { uuid: resource.uuid },
            body: {
              extension_months: formData.extension_months,
              limits: serializedLimits,
              request_comment: formData.purchase_order_reference,
            },
          });
        });

        const results = await Promise.allSettled(promises);
        const errorResults = results.filter((res) => res.status === 'rejected');
        const successResults = results.filter(
          (res) => res.status === 'fulfilled',
        );

        if (successResults.length) {
          resolve.refetch?.();
          if (isMulti) {
            showSuccess(
              translate('Renewal request has been created for {n} resources.', {
                n: successResults.length,
              }),
            );
          } else {
            showSuccess(translate('Renewal request has been created.'));
          }
        }
        if (errorResults.length) {
          showErrorResponse(errorResults[0].reason);
        } else {
          closeDialog();
          // For single resource, redirect to the order detail page
          if (!isMulti && successResults.length === 1) {
            const orderUuid = successResults[0].value.data.order_uuid;
            router.stateService.go('marketplace-orders.details', {
              order_uuid: orderUuid,
            });
          }
        }
      } catch (e) {
        showErrorResponse(e, translate('Unable to send renewal request.'));
      }
    },
    [
      resources,
      resolve,
      showSuccess,
      showErrorResponse,
      closeDialog,
      isMulti,
      router,
    ],
  );

  // Show loading state when fetching resource
  if (shouldFetch && isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-10">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error if fetch failed
  if (shouldFetch && error) {
    return (
      <div className="text-danger p-5">
        {translate('Failed to load resource. Please try again.')}
      </div>
    );
  }

  // Don't render if no resources available
  if (!resources.length) {
    return (
      <div className="text-muted p-5">
        {translate('No resource available for renewal.')}
      </div>
    );
  }

  const initialValues = {
    ...resources.reduce((acc, resource) => {
      acc[resource.uuid] = { limits: resource.limits };
      return acc;
    }, {}),
    extension_months:
      resources[0]?.offering_components?.find((c) => c.is_prepaid)
        ?.min_renewal_duration ?? 1,
  };

  return (
    <Wizard<RenewAllocationFormData>
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
      initialValues={initialValues as Partial<RenewAllocationFormData>}
      data={{ resources }}
      modalProps={{ bodyClassName: 'h-450px' }}
    />
  );
};
