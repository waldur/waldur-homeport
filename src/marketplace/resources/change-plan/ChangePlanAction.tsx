import { ArrowsLeftRightIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import {
  marketplaceResourcesOfferingRetrieve,
  marketplaceResourcesRetrieve,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { validateState } from '@/resource/actions/base';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { useUser } from '@/workspace/hooks';

import { ResourceAction } from '../actions/constants';

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
  const user = useUser();

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
    staleTime: STALE_TIME, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Don't show action if no marketplace resource UUID
  if (!resource.marketplace_resource_uuid) {
    return null;
  }

  // Hide if user lacks permission to switch plan
  if (
    !hasPermission(user, {
      permission: PermissionEnum.SWITCH_RESOURCE_PLAN,
      projectId: resource.project_uuid,
      customerId: resource.customer_uuid,
    })
  ) {
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
      actionId={ResourceAction.SWITCH_PLAN}
    />
  );
};
