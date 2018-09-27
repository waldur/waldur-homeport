import * as React from 'react';
import { connect } from 'react-redux';

import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';

import { ComponentRow } from './ComponentRow';
import { pricesSelector } from './selectors';
import { Component, PricesData } from './types';

const HeaderRow = (props: {periods: string[]}) => (
  <tr>
    <th className="col-sm-1">
      {translate('Component name')}
    </th>
    <th className="col-sm-1">
      {translate('Quantity')}
    </th>
    <th className="col-sm-1">
      {translate('Unit')}
    </th>
    {props.periods.map((period, index) => (
      <th className="col-sm-1" key={index}>
        {period}
        <PriceTooltip/>
      </th>
    ))}
  </tr>
);

const FixedRows = (props: {components: Component[]}) => (
  <>
    {props.components.map((component, index) => (
      <ComponentRow key={index} component={component}/>
    ))}
  </>
);

const UsageRows = (props: {periods: string[], components: Component[]}) => (
  <>
    <tr className="text-center">
      <td colSpan={3 + props.periods.length}>
        {translate('Please enter estimated maximum usage in the rows below:')}
      </td>
    </tr>
    {props.components.map((component, index) => (
      <ComponentRow key={index} component={component}/>
    ))}
  </>
);

const TotalRow = props => (
  <tr>
    <td colSpan={3}>
      {translate('Total')}
    </td>
    {props.totalPeriods.map((price, index) => (
      <td key={index}>
        {defaultCurrency(price)}
      </td>
    ))}
  </tr>
);

const PureDetailsTable = (props: PricesData) => {
  if (props.components.length === 0) {
    return null;
  }

  const fixedRows = props.components.filter(component => component.billing_type === 'fixed');
  const usageRows = props.components.filter(component => component.billing_type === 'usage');

  return (
    <div className="form-group">
      <div className="col-sm-offset-3 col-sm-9">
        <table className="table table-bordered">
          <thead>
            <HeaderRow periods={props.periods}/>
          </thead>
          <tbody>
            {fixedRows.length > 0 && <FixedRows components={fixedRows}/>}
            {usageRows.length > 0 && <UsageRows components={usageRows} periods={props.periods}/>}
            {props.components.length > 1 && <TotalRow totalPeriods={props.totalPeriods}/>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const connector = connect(pricesSelector);

export const PlanDetailsTable = connector(PureDetailsTable);
