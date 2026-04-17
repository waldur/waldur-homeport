import { useQuery } from '@tanstack/react-query';
import React from 'react';
import {
  marketplaceResourcesOfferingRetrieve,
  marketplaceResourcesRetrieve,
  projectsRetrieve,
} from 'waldur-js-client';

import { STALE_TIME, UI_STALE_TIME } from '@waldur/core/constants';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { BillingPeriod } from '@waldur/marketplace/common/BillingPeriod';
import { getFormLimitParser } from '@waldur/marketplace/common/registry';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { VersionHistoryButton } from '@waldur/version-history';

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
          <p>
            <strong>{translate('Plan name')}</strong>: {data.plan.name}
          </p>
          {data.plan.description && (
            <p>
              <strong>{translate('Plan description')}</strong>:{' '}
              {data.plan.description}
            </p>
          )}
          {data.plan.unit_price > 0 && !concealBillingInfo && (
            <>
              <p>
                <strong>{translate('Plan price')}</strong>:{' '}
                {defaultCurrency(data.plan.unit_price)}
              </p>
              <p>
                <strong>{translate('Billing period')}</strong>:{' '}
                <BillingPeriod unit={data.plan.unit} />
              </p>
            </>
          )}
          <PureDetailsTable
            {...data}
            viewMode={true}
            concealBillingInfo={concealBillingInfo}
          />
        </>
      )}
    </ModalDialog>
  );
};
