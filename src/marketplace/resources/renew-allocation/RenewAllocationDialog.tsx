import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import {
  marketplaceResourcesRenew,
  marketplaceResourcesRetrieve,
  Resource,
} from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ProgressStep } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';
import {
  getFormLimitParser,
  getFormLimitSerializer,
} from '@waldur/marketplace/common/registry';
import { useModal } from '@waldur/modal/hooks';
import { useNotify } from '@waldur/store/hooks';
import { Wizard } from '@waldur/wizard';

import { Step1UpdateLimits } from './Step1UpdateLimits';
import { Step2ExtendDuration } from './Step2ExtendDuration';
import { Step3ReviewConfirm } from './Step3ReviewConfirm';
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
  Step3ReviewConfirm,
];

const steps: ProgressStep[] = [
  {
    key: 'limits',
    label: translate('Update limits'),
    completed: false,
  },
  {
    key: 'duration',
    label: translate('Extension period'),
    completed: false,
  },
  {
    key: 'review',
    label: translate('Review & confirm'),
    completed: false,
  },
];

const getResourceUuid = (resource) =>
  resource.marketplace_resource_uuid || resource.uuid;

export const RenewAllocationDialog: FC<RenewAllocationDialogProps> = ({
  resolve,
}) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  // Always fetch the marketplace resource to get end_date and other fields
  // that may not be on the backend resource object (e.g. OpenStack tenant)
  const marketplaceResourceUuid = resolve.resource
    ? getResourceUuid(resolve.resource)
    : resolve.resource_uuid;

  const {
    data: fetchedResource,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['renew-resource', marketplaceResourceUuid],
    queryFn: () =>
      marketplaceResourcesRetrieve({
        path: { uuid: marketplaceResourceUuid },
      }).then((response) => response.data),
    enabled: Boolean(marketplaceResourceUuid),
    staleTime: 5 * 60 * 1000,
  });

  const resources = useMemo(() => {
    if (resolve.resources?.length) {
      return resolve.resources;
    }
    if (fetchedResource) {
      return [fetchedResource];
    }
    return [];
  }, [resolve.resources, fetchedResource]);

  const isMulti = resources.length > 1;

  const onSubmit = useCallback(
    async (formData: RenewAllocationFormData) => {
      try {
        const promises = resources.map((resource) => {
          const resourceUuid = getResourceUuid(resource);
          const limitSerializer = getFormLimitSerializer(
            resource.offering_type || '',
          );
          const serializedLimits = limitSerializer(
            formData[resourceUuid]?.limits || {},
          );

          return marketplaceResourcesRenew({
            path: { uuid: resourceUuid },
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
        }
      } catch (e) {
        showErrorResponse(e, translate('Unable to send renewal request.'));
      }
    },
    [resources, resolve, showSuccess, showErrorResponse, closeDialog, isMulti],
  );

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-10">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-danger p-5">
        {translate('Failed to load resource. Please try again.')}
      </div>
    );
  }

  if (!resources.length) {
    return (
      <div className="text-muted p-5">
        {translate('No resource available for renewal.')}
      </div>
    );
  }

  const initialValues = {
    ...resources.reduce((acc, resource) => {
      const limitParser = getFormLimitParser(resource.offering_type || '');
      acc[getResourceUuid(resource)] = {
        limits: limitParser(resource.limits),
      };
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
      subtitle={translate(
        'Extend the allocation period and optionally update limits.',
      )}
      initialValues={initialValues as Partial<RenewAllocationFormData>}
      data={{ resources }}
      modalProps={{ bodyClassName: 'h-450px' }}
    />
  );
};
