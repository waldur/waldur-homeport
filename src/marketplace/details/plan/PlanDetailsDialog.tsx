import { useQuery } from '@tanstack/react-query';
import React from 'react';
import {
  marketplaceResourcesOfferingRetrieve,
  marketplaceResourcesRetrieve,
  projectsRetrieve,
} from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { STALE_TIME, UI_STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { BillingPeriod } from '@/marketplace/common/BillingPeriod';
import { getFormLimitParser } from '@/marketplace/common/registry';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { propVal } from '@/property/propertyFields';
import { VersionHistoryButton } from '@/version-history';

import { getPlanBillingMode, getPlanBillingModeLabel } from './billingMode';
import { PureDetailsTable } from './PlanDetailsTable';
import { combinePrices } from './utils';

interface PlanDetailsDialogProps {
  resolve: { resourceId: string };
}

async function loadData(resourceId: string) {
  const [resource, offering] = await Promise.all([
    marketplaceResourcesRetrieve({
      path: { uuid: resourceId },
      query: {
        field: [
          'offering_uuid',
          'project_uuid',
          'plan',
          'plan_uuid',
          'limits',
          'current_usages',
          'end_date',
          'created',
        ],
      },
    }).then((r) => r.data),
    marketplaceResourcesOfferingRetrieve({
      path: { uuid: resourceId },
    }).then((response) => response.data),
  ]);
  const plan =
    resource.plan &&
    offering.plans.find((item) => item.uuid === resource.plan_uuid);
  const limitParser = getFormLimitParser(offering.type);
  return {
    resource,
    offering,
    plan: plan && {
      ...plan,
      unit_price:
        typeof plan.unit_price === 'string'
          ? parseFloat(plan.unit_price)
          : plan.unit_price,
    },
    ...combinePrices(
      plan,
      limitParser(resource.limits),
      limitParser(resource.current_usages),
      offering,
      resource.end_date,
      resource.created,
    ),
  };
}

export const PlanDetailsDialog: React.FC<PlanDetailsDialogProps> = (props) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['resource-plan-data', props.resolve.resourceId],
    queryFn: () => loadData(props.resolve.resourceId),
    refetchOnWindowFocus: false,
    staleTime: UI_STALE_TIME,
  });

  // Use the same caching pattern as ResourceDetailsHeaderBody for project data
  const { data: project } = useQuery({
    queryKey: ['display-project-billing', data?.resource?.project_uuid],
    queryFn: () =>
      data?.resource?.project_uuid
        ? projectsRetrieve({
            path: { uuid: data.resource.project_uuid },
            query: { field: ['customer_display_billing_info_in_projects'] },
          }).then((response) => response.data)
        : null,
    enabled: !!data?.resource?.project_uuid,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const concealBillingInfo =
    isFeatureVisible(MarketplaceFeatures.conceal_prices) ||
    project?.customer_display_billing_info_in_projects === false;

  return (
    <ModalDialog
      title={translate('Plan details')}
      footer={
        <>
          {data?.plan && (
            <VersionHistoryButton
              entityType="plan"
              entityUuid={data.plan.uuid}
              entityName={data.plan.name}
            />
          )}
          <CloseDialogButton label={translate('Done')} />
        </>
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <p>{translate('Unable to load plan details.')}</p>
      ) : !data.plan ? (
        <p>{translate('Resource does not have plan.')}</p>
      ) : (
        <>
          <PropertyList variant="summary" className="mb-5">
            <PropertyItem
              label={translate('Plan name')}
              value={data.plan.name}
            />
            <PropertyItem
              label={translate('Plan description')}
              value={data.plan.description}
            />
            <PropertyItem
              label={translate('Billing mode')}
              value={getPlanBillingModeLabel(
                getPlanBillingMode(data.offering, data.plan),
              )}
            />
            {data.plan.unit_price > 0 && !concealBillingInfo && (
              <>
                <PropertyItem
                  label={translate('Plan price')}
                  value={propVal.currency(data.plan.unit_price)}
                />
                <PropertyItem
                  label={translate('Billing period')}
                  value={<BillingPeriod unit={data.plan.unit} />}
                />
              </>
            )}
          </PropertyList>
          <PureDetailsTable
            {...data}
            viewMode={true}
            concealBillingInfo={concealBillingInfo}
            endDate={data.resource.end_date}
            startDate={data.resource.created}
          />
        </>
      )}
    </ModalDialog>
  );
};
