import { FunctionComponent, useMemo, useState } from 'react';
import { connect, useSelector } from 'react-redux';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { concealPricesSelector } from '@waldur/marketplace/deploy/utils';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { getCustomer } from '@waldur/workspace/selectors';

import { ComponentEditRow2 } from './ComponentEditRow';
import { ComponentRow2 } from './ComponentRow';
import { Component, PlanDetailsTableProps, PlanPeriod } from './types';
import { UsageComponentRow } from './UsageComponentRow';
import { calculateTotalPeriods, pricesSelector } from './utils';

import './PlanDetailTable2.scss';

const FixedRows = (props: {
  components: Component[];
  hidePrices?: boolean;
  period?: PlanPeriod;
  activePriceIndex?: number;
}) => (
  <>
    {props.components.map((component, index) => (
      <ComponentRow2
        key={index}
        offeringComponent={component}
        hidePrices={props.hidePrices}
        period={props.period}
        activePriceIndex={props.activePriceIndex}
      >
        {component.amount}x
      </ComponentRow2>
    ))}
  </>
);

const UsageRows = (props: {
  components: Component[];
  hidePrices?: boolean;
  period?: PlanPeriod;
}) => (
  <>
    {props.components.map((component, index) => (
      <UsageComponentRow
        key={index}
        offeringComponent={component}
        hidePrices={props.hidePrices}
        period={props.period}
      />
    ))}
  </>
);

const ControlRows = (props: {
  components: Component[];
  hidePrices?: boolean;
  viewMode: boolean;
  period?: PlanPeriod;
  activePriceIndex?: number;
}) =>
  props.viewMode ? (
    <FixedRows
      components={props.components}
      hidePrices={props.hidePrices}
      period={props.period}
      activePriceIndex={props.activePriceIndex}
    />
  ) : (
    <>
      {props.components.map((component, index) => (
        <ComponentEditRow2
          key={index}
          component={component}
          hidePrices={props.hidePrices}
          period={props.period}
          activePriceIndex={props.activePriceIndex}
        />
      ))}
    </>
  );

const SeparatorRow = (props: { message?: any }) => (
  <tr className="separator-space">
    <td colSpan={5}>{props.message}</td>
  </tr>
);

const ComponentRowTotal = (props: {
  amount: number;
  from?: boolean;
  period?: PlanPeriod;
  final?: boolean;
}) => {
  return (
    <tr className={'total' + (props.final ? ' total-final' : '')}>
      <th colSpan={props.final ? 3 : 4}>{translate('Total')}</th>
      <td colSpan={props.final ? 2 : 1}>
        {props.from ? translate('From') + ' ' : ''}
        {defaultCurrency(props.amount)}
        {Boolean(props.period) && (
          <>
            {' '}
            /{props.period === 'annual' ? 'year' : props.final ? 'month' : 'mo'}
          </>
        )}
      </td>
    </tr>
  );
};

export const PureDetailsTable: FunctionComponent<PlanDetailsTableProps> = (
  props,
) => {
  if (props.components.length === 0) {
    return null;
  }

  const [selectedPeriod, setSelectedPeriod] = useState<PlanPeriod>('monthly');

  const customer = useSelector(getCustomer);
  const activeFixedPriceProfile =
    customer && getActiveFixedPricePaymentProfile(customer.payment_profiles);

  const shouldConcealPrices = useSelector(concealPricesSelector);

  const activePriceIndex = useMemo(
    () => props.periodKeys.indexOf(selectedPeriod) ?? 0,
    [props.periodKeys, selectedPeriod],
  );

  const fixedRows = props.components.filter(
    (component) => component.billing_type === 'fixed',
  );
  const usageRows = props.components.filter(
    (component) => component.billing_type === 'usage',
  );
  const initialRows = props.components.filter(
    (component) => component.billing_type === 'one',
  );
  const switchRows = props.components.filter(
    (component) => component.billing_type === 'few',
  );
  const limitedRows = props.components.filter(
    (component) => component.billing_type === 'limit',
  );
  const totalLimitedRows = limitedRows.filter(
    (component) =>
      !component.limit_period || component.limit_period === 'total',
  );
  const periodicLimitedRows = limitedRows.filter(
    (component) => component.limit_period && component.limit_period !== 'total',
  );

  const fixedTotalPeriods = useMemo(
    () => calculateTotalPeriods(fixedRows),
    [fixedRows],
  );
  const periodicLimitedTotalPeriods = useMemo(
    () => calculateTotalPeriods(periodicLimitedRows),
    [periodicLimitedRows],
  );
  const initialTotalPeriods = useMemo(
    () => calculateTotalPeriods(initialRows),
    [initialRows],
  );
  const switchTotalPeriods = useMemo(
    () => calculateTotalPeriods(switchRows),
    [switchRows],
  );
  const totalLimitTotalPeriods = useMemo(
    () => calculateTotalPeriods(totalLimitedRows),
    [totalLimitedRows],
  );

  const periodicTotal = useMemo(
    () =>
      props.periods.map(
        (_, i) =>
          (fixedTotalPeriods[i] || 0) + (periodicLimitedTotalPeriods[i] || 0),
      ),
    [fixedTotalPeriods, periodicLimitedTotalPeriods],
  );

  const oneTimeTotal = useMemo(
    () =>
      (initialTotalPeriods[0] || 0) +
      (switchTotalPeriods[0] || 0) +
      (totalLimitTotalPeriods[0] || 0),
    [initialTotalPeriods, switchTotalPeriods, totalLimitTotalPeriods],
  );

  const hasPeriodicCost =
    fixedRows.length > 0 ||
    usageRows.length > 0 ||
    periodicLimitedRows.length > 0;
  const hasOneTimeCost =
    initialRows.length > 0 ||
    switchRows.length > 0 ||
    totalLimitedRows.length > 0;

  if (!hasPeriodicCost && !hasOneTimeCost) {
    return null;
  }

  return (
    <div className="plan-details-container">
      {hasPeriodicCost && (
        <section className="plan-details-section bg-light rounded p-6 mb-10">
          <div className="d-flex justify-content-between">
            <h5 className="mb-6">
              {selectedPeriod === 'monthly'
                ? translate('Monthly cost')
                : translate('Annual cost')}
              <PriceTooltip iconClassName="text-dark" />
            </h5>
            {props.periods.length > 1 && (
              <a
                className="text-link"
                onClick={() => {
                  setSelectedPeriod((prev) =>
                    prev === 'monthly' ? 'annual' : 'monthly',
                  );
                }}
              >
                {selectedPeriod === 'monthly'
                  ? translate('Show yearly estimates')
                  : translate('Show monthly estimates')}
                *
              </a>
            )}
          </div>

          <table className="table-details w-100 mb-12">
            <tbody>
              {/* Fixed */}
              {fixedRows.length > 0 && (
                <>
                  <FixedRows
                    components={fixedRows}
                    hidePrices={Boolean(activeFixedPriceProfile)}
                    period={selectedPeriod}
                  />
                  {!activeFixedPriceProfile ? (
                    <ComponentRowTotal
                      amount={fixedTotalPeriods[activePriceIndex]}
                      period={selectedPeriod}
                    />
                  ) : null}
                  <SeparatorRow />
                </>
              )}

              {/* Usage */}
              {usageRows.length > 0 && (
                <>
                  <UsageRows
                    components={usageRows}
                    hidePrices={shouldConcealPrices}
                    period={selectedPeriod}
                  />
                  {!shouldConcealPrices ? (
                    <ComponentRowTotal
                      amount={0}
                      period={selectedPeriod}
                      from
                    />
                  ) : null}
                  <SeparatorRow />
                </>
              )}

              {/* Limit */}
              {periodicLimitedRows.length > 0 && (
                <>
                  <ControlRows
                    components={periodicLimitedRows}
                    hidePrices={Boolean(shouldConcealPrices)}
                    viewMode={props.viewMode}
                    period={selectedPeriod}
                    activePriceIndex={activePriceIndex}
                  />
                  {!shouldConcealPrices ? (
                    <ComponentRowTotal
                      amount={periodicLimitedTotalPeriods[activePriceIndex]}
                      period={selectedPeriod}
                    />
                  ) : null}
                  <SeparatorRow />
                </>
              )}

              {!activeFixedPriceProfile ? (
                <ComponentRowTotal
                  amount={periodicTotal[activePriceIndex]}
                  period={selectedPeriod}
                  final
                />
              ) : null}
            </tbody>
          </table>
        </section>
      )}

      {hasOneTimeCost && (
        <section className="plan-details-section bg-light rounded p-6">
          <h5 className="mb-6">
            {translate('One time cost')}
            <PriceTooltip iconClassName="text-dark" />
          </h5>

          <table className="table-details table-details-limit w-100">
            <tbody>
              {/* One */}
              {initialRows.length > 0 && (
                <>
                  <FixedRows
                    components={initialRows}
                    hidePrices={shouldConcealPrices}
                  />
                  {!shouldConcealPrices ? (
                    <ComponentRowTotal amount={initialTotalPeriods[0]} />
                  ) : null}
                  <SeparatorRow />
                </>
              )}

              {/* Few */}
              {switchRows.length > 0 && (
                <>
                  <FixedRows
                    components={switchRows}
                    hidePrices={shouldConcealPrices}
                  />
                  {!shouldConcealPrices ? (
                    <ComponentRowTotal amount={switchTotalPeriods[0]} />
                  ) : null}
                  <SeparatorRow />
                </>
              )}

              {/* Limit */}
              {totalLimitedRows.length > 0 && (
                <>
                  <ControlRows
                    components={totalLimitedRows}
                    hidePrices={Boolean(shouldConcealPrices)}
                    viewMode={props.viewMode}
                  />
                  {!shouldConcealPrices ? (
                    <ComponentRowTotal amount={totalLimitTotalPeriods[0]} />
                  ) : null}
                  <SeparatorRow />
                </>
              )}

              <ComponentRowTotal amount={oneTimeTotal} final />
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

export const PlanDetailsTable2 = connect(pricesSelector)(PureDetailsTable);
