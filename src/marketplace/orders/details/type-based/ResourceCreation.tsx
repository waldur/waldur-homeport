import { connect } from 'react-redux';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { useShouldConcealPrices } from '@waldur/marketplace/common/useShouldConcealPrices';
import { PricesData } from '@waldur/marketplace/details/plan/types';
import { pricesSelector } from '@waldur/marketplace/details/plan/utils';
import { Field } from '@waldur/resource/summary';

import { OrderFieldEditButton } from '../OrderFieldEditButton';

import { ComponentsSection, useGroupedComponents } from './ComponentsSection';
import {
  OrderTypeBasedProps,
  RequestedByField,
  RequestCommentField,
} from './OrderCommonFields';

const PureResourceCreation = ({
  order,
  offering,
  editable,
  components,
}: OrderTypeBasedProps & PricesData) => {
  const shouldConcealPrices = useShouldConcealPrices(order.project_uuid);
  const {
    usageRows,
    initialRows,
    prepaidRows,
    switchRows,
    totalLimitedRows,
    hasPeriodicRows,
    periodicComponents,
  } = useGroupedComponents(components);

  return (
    <>
      <RequestedByField order={order} />
      <RequestCommentField order={order} />
      <Field
        label={translate('Start date')}
        labelWidth={200}
        value={
          <>
            {order.start_date
              ? formatDate(order.start_date)
              : translate('Not set')}
            {editable && (
              <OrderFieldEditButton
                order={order}
                offering={offering}
                name="start_date"
              />
            )}
          </>
        }
      />

      {hasPeriodicRows && (
        <ComponentsSection
          title={translate('Periodic cost components')}
          components={periodicComponents}
          showQuantity
          hidePrices={shouldConcealPrices}
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
          hidePrices={shouldConcealPrices}
        />
      )}

      {totalLimitedRows.length > 0 && (
        <ComponentsSection
          title={translate(
            'Fee applied according to the maximum value reported by service provider over the whole active state of resource.',
          )}
          components={totalLimitedRows}
          showQuantity
          hidePrices={shouldConcealPrices}
        />
      )}

      {initialRows.length > 0 && (
        <ComponentsSection
          title={translate('A one-time fee applied on activation.')}
          components={initialRows}
          hidePrices={shouldConcealPrices}
        />
      )}

      {prepaidRows.length > 0 && (
        <ComponentsSection
          title={translate(
            'Prepaid fee applied on activation based on ordered quantity and duration.',
          )}
          components={prepaidRows}
          showQuantity
          hidePrices={shouldConcealPrices}
        />
      )}

      {switchRows.length > 0 && (
        <ComponentsSection
          title={translate('Fee applied each time this plan is activated.')}
          components={switchRows}
          hidePrices={shouldConcealPrices}
        />
      )}
    </>
  );
};

const mapProps = (props: OrderTypeBasedProps) => ({
  ...props,
  viewMode: true,
  type: 'new' as const,
});

const ConnectedResourceCreation = connect(pricesSelector)(PureResourceCreation);

export const ResourceCreation = (props: OrderTypeBasedProps) => (
  <ConnectedResourceCreation {...mapProps(props)} />
);
