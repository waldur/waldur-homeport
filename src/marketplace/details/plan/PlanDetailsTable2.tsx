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
import { pricesSelector, useComponentsDetailPrices } from './utils';

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

  const { periodic, oneTime } = useComponentsDetailPrices(props);
  const [selectedPeriod, setSelectedPeriod] = useState<PlanPeriod>('monthly');

  const customer = useSelector(getCustomer);
  const activeFixedPriceProfile =
    customer && getActiveFixedPricePaymentProfile(customer.payment_profiles);

  const shouldConcealPrices = useSelector(concealPricesSelector);

  const activePriceIndex = useMemo(
    () => props.periodKeys.indexOf(selectedPeriod) ?? 0,
    [props.periodKeys, selectedPeriod],
  );

  if (!periodic.hasPeriodicCost && !oneTime.hasOneTimeCost) {
    return null;
  }

  return (
    <div className="plan-details-container">
      {periodic.hasPeriodicCost && (
        <section className="plan-details-section bg-light rounded p-6 mb-10">
          <div className="d-flex justify-content-between">
            <h5 className="mb-6">
              {selectedPeriod === 'monthly'
                ? shouldConcealPrices
                  ? translate('Monthly')
                  : translate('Monthly cost')
                : shouldConcealPrices
                ? translate('Annual')
                : translate('Annual cost')}
              {!shouldConcealPrices && (
                <PriceTooltip iconClassName="text-dark" />
              )}
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

          <table className="table-details w-100">
            <tbody>
              {/* Fixed */}
              {periodic.fixedRows.length > 0 && (
                <>
                  <FixedRows
                    components={periodic.fixedRows}
                    hidePrices={Boolean(
                      activeFixedPriceProfile && !shouldConcealPrices,
                    )}
                    period={selectedPeriod}
                    activePriceIndex={activePriceIndex}
                  />
                  {!activeFixedPriceProfile && !shouldConcealPrices ? (
                    <ComponentRowTotal
                      amount={periodic.fixedTotalPeriods[activePriceIndex]}
                      period={selectedPeriod}
                    />
                  ) : null}
                  <SeparatorRow />
                </>
              )}

              {/* Usage */}
              {periodic.usageRows.length > 0 && (
                <>
                  <UsageRows
                    components={periodic.usageRows}
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
              {periodic.periodicLimitedRows.length > 0 && (
                <>
                  <ControlRows
                    components={periodic.periodicLimitedRows}
                    hidePrices={Boolean(shouldConcealPrices)}
                    viewMode={props.viewMode}
                    period={selectedPeriod}
                    activePriceIndex={activePriceIndex}
                  />
                  {!shouldConcealPrices ? (
                    <ComponentRowTotal
                      amount={
                        periodic.periodicLimitedTotalPeriods[activePriceIndex]
                      }
                      period={selectedPeriod}
                    />
                  ) : null}
                  <SeparatorRow />
                </>
              )}

              {!activeFixedPriceProfile && !shouldConcealPrices ? (
                <ComponentRowTotal
                  amount={periodic.periodicTotal[activePriceIndex]}
                  period={selectedPeriod}
                  final
                />
              ) : null}
            </tbody>
          </table>
        </section>
      )}

      {oneTime.hasOneTimeCost && (
        <section className="plan-details-section bg-light rounded p-6">
          <h5 className="mb-6">
            {shouldConcealPrices ? (
              translate('One time')
            ) : (
              <>
                {translate('One time cost')}
                <PriceTooltip iconClassName="text-dark" />
              </>
            )}
          </h5>

          <table className="table-details table-details-limit w-100">
            <tbody>
              {/* One */}
              {oneTime.initialRows.length > 0 && (
                <>
                  <FixedRows
                    components={oneTime.initialRows}
                    hidePrices={shouldConcealPrices}
                    activePriceIndex={0}
                  />
                  {!shouldConcealPrices ? (
                    <ComponentRowTotal
                      amount={oneTime.initialTotalPeriods[0]}
                    />
                  ) : null}
                  <SeparatorRow />
                </>
              )}

              {/* Few */}
              {oneTime.switchRows.length > 0 && (
                <>
                  <FixedRows
                    components={oneTime.switchRows}
                    hidePrices={shouldConcealPrices}
                    activePriceIndex={0}
                  />
                  {!shouldConcealPrices ? (
                    <ComponentRowTotal amount={oneTime.switchTotalPeriods[0]} />
                  ) : null}
                  <SeparatorRow />
                </>
              )}

              {/* Limit */}
              {oneTime.totalLimitedRows.length > 0 && (
                <>
                  <ControlRows
                    components={oneTime.totalLimitedRows}
                    hidePrices={Boolean(shouldConcealPrices)}
                    viewMode={props.viewMode}
                    activePriceIndex={0}
                  />
                  {!shouldConcealPrices ? (
                    <ComponentRowTotal
                      amount={oneTime.totalLimitTotalPeriods[0]}
                    />
                  ) : null}
                  <SeparatorRow />
                </>
              )}

              {!shouldConcealPrices && (
                <ComponentRowTotal amount={oneTime.oneTimeTotal} final />
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

export const PlanDetailsTable2 = connect(pricesSelector)(PureDetailsTable);
