import { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';
import { connect, useSelector } from 'react-redux';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { getCustomer } from '@waldur/workspace/selectors';

import { ComponentItem } from './ComponentItem';
import { LimitlessComponentsList } from './LimitlessComponentsList';
import { TotalLimitComponentsList } from './TotalLimitComponentsList';
import { Component, PlanDetailsTableProps } from './types';
import { pricesSelector } from './utils';

const HeaderRow = (props: { periods?: string[] }) => (
  <tr>
    <th className="col-sm-1" style={{ width: '5%' }}>
      {translate('Component name')}
    </th>
    {props.periods.map((period, index) => (
      <th className="col-sm-1" key={index}>
        {period}
        <PriceTooltip />
      </th>
    ))}
  </tr>
);

const FixedRows = (props: { components: Component[] }) => (
  <>
    {props.components.map((component, index) => (
      <ComponentItem key={index} offeringComponent={component} />
    ))}
  </>
);

export const PureDetailsList: FunctionComponent<PlanDetailsTableProps> = (
  props,
) => {
  if (props.components.length === 0) {
    return null;
  }

  const customer = useSelector(getCustomer);
  const activeFixedPriceProfile =
    customer && getActiveFixedPricePaymentProfile(customer.payment_profiles);

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
          <Table bordered={true}>
            <thead>
              <HeaderRow
                periods={!activeFixedPriceProfile ? props.periods : []}
              />
            </thead>
            <tbody>
              {fixedRows.length > 0 && <FixedRows components={fixedRows} />}
              {otherLimitedRows.length > 0 && (
                <FixedRows components={otherLimitedRows} />
              )}
              {!activeFixedPriceProfile ? (
                <tr>
                  <td colSpan={1}>{translate('Total')}</td>
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
            <LimitlessComponentsList components={usageRows} />
          </>
        )}
        {totalLimitedRows.length > 0 && (
          <>
            <p>
              {translate(
                'Fee applied according to the maximum value reported by service provider over the whole active state of resource.',
              )}
            </p>
            <TotalLimitComponentsList
              components={totalLimitedRows}
              total={totalLimitTotal}
            />
          </>
        )}
        {initialRows.length > 0 && (
          <>
            <p>{translate('A one-time fee applied on activation.')}</p>
            <LimitlessComponentsList components={initialRows} />
          </>
        )}
        {switchRows.length > 0 && (
          <>
            <p>{translate('Fee applied each time this plan is activated.')}</p>
            <LimitlessComponentsList components={switchRows} />
          </>
        )}
      </div>
    </div>
  );
};

export const PlanDetailsList = connect(pricesSelector)(PureDetailsList);
