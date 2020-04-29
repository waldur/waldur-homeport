import * as React from 'react';
import { connect } from 'react-redux';

import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';

import { ComponentEditRow } from './ComponentEditRow';
import { ComponentRow } from './ComponentRow';
import { LimitlessComponentsTable } from './LimitlessComponentsTable';
import { Component, PlanDetailsTableProps } from './types';
import { pricesSelector } from './utils';

const HeaderRow = (props: { periods: string[] }) => (
  <tr>
    <th className="col-sm-1">{translate('Component name')}</th>
    <th className="col-sm-1">{translate('Quantity')}</th>
    <th className="col-sm-1">{translate('Unit')}</th>
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
      <ComponentRow key={index} offeringComponent={component}>
        {component.amount}
      </ComponentRow>
    ))}
  </>
);

const UsageRows = (props: {
  periods: string[];
  components: Component[];
  viewMode: boolean;
}) =>
  props.viewMode ? (
    <FixedRows components={props.components} />
  ) : (
    <>
      {props.components.map((component, index) => (
        <ComponentEditRow key={index} component={component} />
      ))}
    </>
  );

export const PureDetailsTable: React.FC<PlanDetailsTableProps> = (
  props: PlanDetailsTableProps,
) => {
  if (props.components.length === 0) {
    return null;
  }

  const fixedRows = props.components.filter(
    component => component.billing_type === 'fixed',
  );
  const fixedWithLimits = fixedRows.filter(component =>
    props.limits.includes(component.type),
  );
  const fixedWithoutLimits = fixedRows.filter(
    component => !props.limits.includes(component.type),
  );
  const usageRows = props.components.filter(
    component => component.billing_type === 'usage',
  );
  const initialRows = props.components.filter(
    component => component.billing_type === 'one',
  );
  const switchRows = props.components.filter(
    component => component.billing_type === 'few',
  );
  const usageWithLimits = usageRows.filter(
    component => component.disable_quotas === false,
  );
  const usageWithoutLimits = usageRows.filter(
    component => component.disable_quotas === true,
  );
  const hasExtraRows = fixedRows.length > 0 || usageWithLimits.length > 0;
  const limitedRows = [...fixedWithLimits, ...usageWithLimits];

  return (
    <div className={props.formGroupClassName}>
      <div className={props.columnClassName}>
        {hasExtraRows && (
          <table className="table table-bordered">
            <thead>
              <HeaderRow periods={props.periods} />
            </thead>
            <tbody>
              {fixedWithoutLimits.length > 0 && (
                <FixedRows components={fixedWithoutLimits} />
              )}
              {!props.viewMode &&
                limitedRows.length > 0 &&
                fixedWithoutLimits.length > 0 && (
                  <tr className="text-center">
                    <td colSpan={3 + props.periods.length}>
                      {translate(
                        'Please enter desired values in the rows below:',
                      )}
                    </td>
                  </tr>
                )}
              {limitedRows.length > 0 && (
                <UsageRows
                  components={limitedRows}
                  periods={props.periods}
                  viewMode={props.viewMode}
                />
              )}
              <tr>
                <td colSpan={3}>{translate('Total')}</td>
                {props.totalPeriods.map((price, index) => (
                  <td key={index}>{defaultCurrency(price)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        )}
        {usageWithoutLimits.length > 0 && (
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
            <LimitlessComponentsTable components={usageWithoutLimits} />
          </>
        )}
        {initialRows.length > 0 && (
          <>
            <p>{translate('A one-time fee applied on activation.')}</p>
            <LimitlessComponentsTable components={initialRows} />
          </>
        )}
        {switchRows.length > 0 && (
          <>
            <p>{translate('Fee applied each time this plan is activated.')}</p>
            <LimitlessComponentsTable components={switchRows} />
          </>
        )}
      </div>
    </div>
  );
};

PureDetailsTable.defaultProps = {
  formGroupClassName: 'form-group',
  columnClassName: 'col-sm-offset-3 col-sm-9',
  limits: [],
};

const connector = connect(pricesSelector);

export const PlanDetailsTable = connector(PureDetailsTable);
