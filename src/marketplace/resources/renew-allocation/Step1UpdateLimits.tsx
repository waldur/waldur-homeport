import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo } from 'react';
import { Card, Tab, Tabs } from 'react-bootstrap';
import { useForm, useFormState } from 'react-final-form';
import { Resource } from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { filterOfferingComponents } from '@waldur/marketplace/common/registry';
import { WizardModal, WizardStepProps } from '@waldur/wizard';

import { ChangeLimitsComponent } from '../change-limits/ChangeLimitsComponent';
import { getLimitChangeData, loadData } from '../change-limits/utils';

import { RenewAllocationFormData } from './types';

interface OwnProps extends WizardStepProps {
  data: { resources: Array<Resource & { marketplace_resource_uuid }> };
}

const getUuid = (resource) =>
  resource.marketplace_resource_uuid || resource.uuid;

// Component to display one-time component pricing when no limit components exist
const OneTimeComponentsSummary: FC<{
  data: Awaited<ReturnType<typeof loadData>>;
}> = ({ data }) => {
  const { offering, plan } = data;
  const shouldConcealPrices =
    isFeatureVisible(MarketplaceFeatures.conceal_prices) ||
    data.concealBillingInfo;

  // Get one-time components from the offering
  const oneTimeComponents = useMemo(() => {
    const components = filterOfferingComponents(offering);
    return components.filter(
      (c) => c.billing_type === 'one' || c.billing_type === 'few',
    );
  }, [offering]);

  if (oneTimeComponents.length === 0) {
    return (
      <div className="text-muted">
        {translate(
          'This offering has no adjustable limits. Continue to extend the allocation period.',
        )}
      </div>
    );
  }

  return (
    <div>
      {plan ? (
        <p>
          <strong>{translate('Current plan')}</strong>: {plan.name}
        </p>
      ) : (
        <p>{translate('Resource does not have any plan.')}</p>
      )}
      <Card className="card-table card-bordered">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <table className="table table-row-bordered align-middle mb-0">
              <thead>
                <tr>
                  <th>{translate('Component')}</th>
                  <th>{translate('Type')}</th>
                  {!shouldConcealPrices && (
                    <th className="text-end">{translate('Unit price')}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {oneTimeComponents.map((component) => {
                  const price = plan?.prices?.[component.type] || 0;
                  return (
                    <tr key={component.type}>
                      <td>
                        <strong>{component.name}</strong>
                        {component.description && (
                          <div className="text-muted small">
                            {component.description}
                          </div>
                        )}
                      </td>
                      <td>
                        {component.is_prepaid
                          ? translate('Prepaid (per month)')
                          : translate('One-time')}
                      </td>
                      {!shouldConcealPrices && (
                        <td className="text-end">
                          {defaultCurrency(price)}
                          {component.measured_unit &&
                            ` / ${component.measured_unit}`}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
      <p className="text-muted mt-3">
        {translate(
          'The renewal cost will be calculated based on the extension period selected in the next step.',
        )}
      </p>
    </div>
  );
};

const UpdateLimitsTable: FC<{
  resource: OwnProps['data']['resources'][0];
}> = (props) => {
  const resource = props.resource;
  const form = useForm();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ChangeLimitsData', getUuid(resource)],
    queryFn: () => loadData(getUuid(resource)),
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
  });

  // Check if offering has any limit-type components
  const hasLimitComponents = useMemo(() => {
    if (!data?.offering) return true; // Assume yes while loading
    const components = filterOfferingComponents(data.offering);
    return components.some((c) => c.billing_type === 'limit' || c.is_prepaid);
  }, [data?.offering]);

  // Sync parsed limits (e.g., MB→GB) to form when data loads
  useEffect(() => {
    if (data?.limits) {
      form.change(`${getUuid(resource)}.limits`, data.limits);
    }
  }, [data?.limits, form, resource]);

  const { values } = useFormState<RenewAllocationFormData>();

  const tableData = useMemo(() => {
    if (data) {
      const newLimits = values[getUuid(resource)]?.limits || data.limits;
      const { offering, plan, usages, limits: currentLimits } = data;
      return getLimitChangeData(
        plan,
        offering,
        newLimits,
        currentLimits,
        usages,
        true,
        data.concealBillingInfo,
      );
    }
    const shouldConcealPrices = isFeatureVisible(
      MarketplaceFeatures.conceal_prices,
    );
    return {
      periods: [],
      components: [],
      totalPeriods: [],
      changedTotalPeriods: [],
      orderCanBeApproved: true,
      offering: null,
      shouldConcealPrices,
    };
  }, [data, values]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  // Show one-time components summary if no limit components exist
  if (!hasLimitComponents) {
    return <OneTimeComponentsSummary data={data} />;
  }

  return (
    <ChangeLimitsComponent
      plan={data.plan}
      periods={tableData.periods}
      components={tableData.components}
      orderCanBeApproved={tableData.orderCanBeApproved}
      totalPeriods={tableData.totalPeriods}
      changedTotalPeriods={tableData.changedTotalPeriods}
      offeringLimits={data.offeringLimits}
      shouldConcealPrices={tableData.shouldConcealPrices}
      parentName={getUuid(resource)}
      finalForm
    />
  );
};

export const Step1UpdateLimits: FC<OwnProps> = (props) => {
  const resources = props.data.resources;
  const isMulti = resources?.length > 1;

  return (
    <WizardModal {...props}>
      {isMulti ? (
        <Tabs
          id="resources-limits-change"
          className="nav nav-stretch nav-line-tabs mb-4"
          unmountOnExit
          mountOnEnter
        >
          {resources.map((resource) => (
            <Tab
              key={resource.uuid}
              eventKey={getUuid(resource)}
              title={resource.name}
            >
              <UpdateLimitsTable resource={resource} />
            </Tab>
          ))}
        </Tabs>
      ) : (
        <UpdateLimitsTable resource={resources[0]} />
      )}
    </WizardModal>
  );
};
