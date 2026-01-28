import { ArrowsLeftRightIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import {
  marketplaceResourcesOfferingRetrieve,
  marketplaceResourcesRetrieve,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const ChangePlanDialog = lazyComponent(() =>
  import('./ChangePlanDialog').then((module) => ({
    default: module.ChangePlanDialog,
  })),
);

const validators = [validateState('OK')];

// Helper function to get available plan choices (similar to utils.tsx getChoices logic)
const getAvailablePlanChoices = (offering, resource) => {
  if (!offering?.plans || !resource) return [];

  return offering.plans.filter((plan) => {
    // Same logic as in utils.tsx - exclude current plan and inactive plans
    return plan.url !== resource.plan && plan.is_active && !plan.archived;
  });
};

export const ChangePlanAction: ActionItemType = ({ resource, refetch }) => {
  // Fetch offering data to check number of available plans
  const { data: offeringData, isLoading } = useQuery({
    queryKey: ['changePlan', resource.marketplace_resource_uuid],
    queryFn: async () => {
      const [resourceData, offeringData] = await Promise.all([
        marketplaceResourcesRetrieve({
          path: { uuid: resource.marketplace_resource_uuid },
        }).then((r) => r.data),
        marketplaceResourcesOfferingRetrieve({
          path: { uuid: resource.marketplace_resource_uuid },
        }).then((r) => r.data),
      ]);
      return { resource: resourceData, offering: offeringData };
    },
    enabled: Boolean(resource.marketplace_resource_uuid),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Don't show action if no marketplace resource UUID
  if (!resource.marketplace_resource_uuid) {
    return null;
  }

  // Don't show action while loading or if only one or no plans available
  if (isLoading || !offeringData) {
    return null;
  }

  const availablePlans = getAvailablePlanChoices(
    offeringData.offering,
    offeringData.resource,
  );

  // Conceal if only current plan is available (no other plans to switch to)
  if (availablePlans.length === 0) {
    return null;
  }

  return (
    <DialogActionItem
      validators={validators}
      title={translate('Change plan')}
      dialogSize="lg"
      modalComponent={ChangePlanDialog}
      resource={resource}
      extraResolve={{ refetch }}
      iconNode={<ArrowsLeftRightIcon weight="bold" />}
    />
  );
};
