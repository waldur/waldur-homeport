import { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';
import { connect, useSelector } from 'react-redux';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { getCustomer } from '@waldur/workspace/selectors';

import { ComponentEditRow } from './ComponentEditRow';
import { ComponentRow } from './ComponentRow';
import { LimitlessComponentsTable } from './LimitlessComponentsTable';
import { TotalLimitComponentsTable } from './TotalLimitComponentsTable';
import { Component, PlanDetailsTableProps } from './types';
import { pricesSelector } from './utils';

const HeaderRow = (props: {
  periods?: string[];
  concealBillingInfo?: boolean;
}) => (
  <tr className="text-start text-muted bg-light fw-bolder fs-7 text-uppercase gs-0">
    <th className="col-sm-1" style={{ width: '5%' }}>
      {translate('Component name')}
    </th>
    <th className="col-sm-1" style={{ width: '5%' }}>
      {translate('Quantity')}
    </th>
    <th className="col-sm-1" style={{ width: '5%' }}>
      {translate('Unit')}
    </th>
    {!props.concealBillingInfo &&
      props.periods.map((period, index) => (
        <th className="col-sm-1" key={index}>
          {period}
          <PriceTooltip />
        </th>
      ))}
  </tr>
);

const FixedRows = (props: {
  components: Component[];
  concealBillingInfo?: boolean;
}) => (
  <>
    {props.components.map((component, index) => (
      <ComponentRow
        key={index}
        offeringComponent={component}
        hidePrices={props.concealBillingInfo}
      >
        {component.amount}
      </ComponentRow>
    ))}
  </>
);

const UsageRows = (props: {
  components: Component[];
  viewMode: boolean;
  concealBillingInfo?: boolean;
}) =>
  props.viewMode ? (
    <FixedRows
      components={props.components}
      concealBillingInfo={props.concealBillingInfo}
    />
  ) : (
    <>
      {props.components.map((component, index) => (
        <ComponentEditRow key={index} component={component} />
      ))}
    </>
  );

export const PureDetailsTable: FunctionComponent<PlanDetailsTableProps> = (
  props,
) => {
  const customer = useSelector(getCustomer);

  if (props.components.length === 0) {
    return null;
  }

  const activeFixedPriceProfile =
    customer && getActiveFixedPricePaymentProfile(customer.payment_profiles);

  const fixedRows = props.components.filter(
    (component) => component.billing_type === 'fixed',
  );
  const usageRows = props.components.filter(
    (component) => component.billing_type === 'usage',
  );
  const initialRows = props.components.filter(
    (component) => component.billing_type === 'one' && !component.is_prepaid,
  );
  const prepaidRows = props.components.filter(
    (component) => component.billing_type === 'one' && component.is_prepaid,
  );
  const prepaidTotal = prepaidRows.reduce(
    (subTotal, component) => subTotal + component.subTotal,
    0,
  );
  const switchRows = props.components.filter(
    (component) => component.billing_type === 'few',
  );
  const limitedRows = props.components.filter(
    (component) => component.billing_type === 'limit',
  );
  const totalLimitedRows = limitedRows.filter(
    (component) => component.limit_period === 'total',
  );
  const otherLimitedRows = limitedRows.filter(
    (component) => component.limit_period !== 'total',
  );
  const totalLimitTotal = totalLimitedRows.reduce(
    (subTotal, component) => subTotal + component.subTotal,
    0,
  );
  const hasExtraRows = fixedRows.length > 0 || otherLimitedRows.length > 0;

  return (
    <div className={props.formGroupClassName}>
      <div className={props.columnClassName}>
        {hasExtraRows && (
          <Table className="table align-middle table-row-bordered fs-6 gy-4 no-footer">
            <thead>
              <HeaderRow
                periods={!activeFixedPriceProfile ? props.periods : []}
                concealBillingInfo={props.concealBillingInfo}
              />
            </thead>
            <tbody>
              {fixedRows.length > 0 && (
                <FixedRows
                  components={fixedRows}
                  concealBillingInfo={props.concealBillingInfo}
                />
              )}
              {!props.viewMode &&
                otherLimitedRows.length > 0 &&
                fixedRows.length > 0 && (
                  <tr className="text-center">
                    <td colSpan={3 + props.periods.length}>
                      {translate(
                        'Please enter desired values in the rows below:',
                      )}
                    </td>
                  </tr>
                )}
              {otherLimitedRows.length > 0 && (
                <UsageRows
                  components={otherLimitedRows}
                  viewMode={props.viewMode}
                  concealBillingInfo={props.concealBillingInfo}
                />
              )}
              {!activeFixedPriceProfile && !props.concealBillingInfo ? (
                <tr>
                  <td colSpan={3}>{translate('Total')}</td>
                  {props.totalPeriods.map((price, index) => (
                    <td key={index}>{defaultCurrency(price)}</td>
                  ))}
                </tr>
              ) : null}
            </tbody>
          </Table>
        )}
        {usageRows.length > 0 && (
          <>
            <p>
              {hasExtraRows
                ? translate(
                    'Additionally service provider can charge for usage of the following components',
                  )
                : translate(
                    'Service provider can charge for usage of the following components',
                  )}
            </p>
            <LimitlessComponentsTable
              components={usageRows}
              concealBillingInfo={props.concealBillingInfo}
            />
          </>
        )}
        {totalLimitedRows.length > 0 && (
          <>
            <p>
              {translate(
                'Fee applied according to the maximum value reported by service provider over the whole active state of resource.',
              )}
            </p>
            <TotalLimitComponentsTable
              components={totalLimitedRows}
              total={totalLimitTotal}
              viewMode={props.viewMode}
              hidePrices={props.concealBillingInfo}
            />
          </>
        )}
        {initialRows.length > 0 && (
          <>
            <p>{translate('A one-time fee applied on activation.')}</p>
            <LimitlessComponentsTable
              components={initialRows}
              concealBillingInfo={props.concealBillingInfo}
            />
          </>
        )}
        {prepaidRows.length > 0 && (
          <>
            <p>
              {translate(
                'Prepaid fee applied on activation based on ordered quantity and duration.',
              )}
            </p>
            <TotalLimitComponentsTable
              components={prepaidRows}
              total={prepaidTotal}
              viewMode={true}
              hidePrices={props.concealBillingInfo}
            />
          </>
        )}
        {switchRows.length > 0 && (
          <>
            <p>{translate('Fee applied each time this plan is activated.')}</p>
            <LimitlessComponentsTable
              components={switchRows}
              concealBillingInfo={props.concealBillingInfo}
            />
          </>
        )}
      </div>
    </div>
  );
};

export const PlanDetailsTable = connect(pricesSelector)(PureDetailsTable);
