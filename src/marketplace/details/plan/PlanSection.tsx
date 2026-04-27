import { connect } from 'react-redux';
import { OrderDetails as OrderResponse } from 'waldur-js-client';

import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { useShouldConcealPrices } from '@/marketplace/common/useShouldConcealPrices';
import { PlanDescriptionButton } from '@/marketplace/details/plan/PlanDescriptionButton';
import {
  ComponentsSection,
  useGroupedComponents,
} from '@/marketplace/orders/details/type-based/ComponentsSection';
import { Offering } from '@/marketplace/types';
import { NoResult } from '@/navigation/header/search/NoResult';
import { Field } from '@/resource/summary';

import { PricesData } from './types';
import { pricesSelector } from './utils';

interface PlanDetailsProps {
  order: OrderResponse;
  offering: Offering;
}

const PurePlanCard = ({
  title,
  planName,
  planDescription,
  components,
  concealBillingInfo,
}: {
  title: string;
  planName: string;
  planDescription?: string;
  concealBillingInfo?: boolean;
} & PricesData) => {
  const {
    usageRows,
    initialRows,
    prepaidRows,
    switchRows,
    totalLimitedRows,
    hasPeriodicRows,
    periodicComponents,
  } = useGroupedComponents(components);

  const renderValue = (value) => (value ? value : <>&mdash;</>);

  return (
    <Panel title={title} cardBordered>
      <Field
        label={translate('Name')}
        labelWidth={200}
        value={renderValue(planName)}
      />
      {planDescription && (
        <Field
          label={translate('Description')}
          labelWidth={200}
          value={
            <PlanDescriptionButton
              className="btn btn-sm btn-secondary"
              planDescription={planDescription}
            />
          }
        />
      )}

      {hasPeriodicRows && (
        <ComponentsSection
          title={translate('Periodic cost components')}
          components={periodicComponents}
          showQuantity
          hidePrices={concealBillingInfo}
        />
      )}

      {usageRows.length > 0 && (
        <ComponentsSection
          title={
            hasPeriodicRows
              ? translate(
                  'Additionally service provider can charge for usage of the following components',
                )
              : translate(
                  'Service provider can charge for usage of the following components',
                )
          }
          components={usageRows}
          hidePrices={concealBillingInfo}
        />
      )}

      {totalLimitedRows.length > 0 && (
        <ComponentsSection
          title={translate(
            'Fee applied according to the maximum value reported by service provider over the whole active state of resource.',
          )}
          components={totalLimitedRows}
          showQuantity
          hidePrices={concealBillingInfo}
        />
      )}

      {initialRows.length > 0 && (
        <ComponentsSection
          title={translate('A one-time fee applied on activation.')}
          components={initialRows}
          hidePrices={concealBillingInfo}
        />
      )}

      {prepaidRows.length > 0 && (
        <ComponentsSection
          title={translate(
            'Prepaid fee applied on activation based on ordered quantity and duration.',
          )}
          components={prepaidRows}
          showQuantity
          hidePrices={concealBillingInfo}
        />
      )}

      {switchRows.length > 0 && (
        <ComponentsSection
          title={translate('Fee applied each time this plan is activated.')}
          components={switchRows}
          hidePrices={concealBillingInfo}
        />
      )}
    </Panel>
  );
};

const ConnectedPlanCard = connect(pricesSelector)(PurePlanCard);

export const PlanSection = (props: PlanDetailsProps) => {
  const shouldConcealPrices = useShouldConcealPrices(props.order.project_uuid);
  const { plan_name, plan_description, old_plan_name } = props.order;

  if (!plan_name) {
    return (
      <Panel title={translate('Plan')} cardBordered>
        <NoResult
          title={translate('No plans found for this order')}
          buttonTitle={null}
          message={null}
          noAction
        />
      </Panel>
    );
  }

  const isRenewal =
    props.order.type === 'Update' &&
    (props.order.attributes as any)?.action === 'renew';
  const isPlanChange =
    props.order.type === 'Update' && !isRenewal && old_plan_name;

  return (
    <>
      {isPlanChange ? (
        <>
          <ConnectedPlanCard
            title={translate('Old plan')}
            planName={old_plan_name}
            planDescription={plan_description}
            order={props.order}
            offering={props.offering}
            viewMode
            type="old"
            concealBillingInfo={shouldConcealPrices}
          />
          <hr />
          <ConnectedPlanCard
            title={translate('New plan')}
            planName={plan_name}
            planDescription={plan_description}
            order={props.order}
            offering={props.offering}
            viewMode
            type="new"
            concealBillingInfo={shouldConcealPrices}
          />
        </>
      ) : (
        <ConnectedPlanCard
          title={translate('Plan')}
          planName={plan_name}
          planDescription={plan_description}
          order={props.order}
          offering={props.offering}
          viewMode
          type="new"
          concealBillingInfo={shouldConcealPrices}
        />
      )}
    </>
  );
};
