import * as React from 'react';
import { Field } from 'redux-form';

import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { parseIntField, formatIntField } from '@waldur/marketplace/common/utils';
import { Plan } from '@waldur/marketplace/types';
import { PriceTooltip } from '@waldur/price/PriceTooltip';

import { StateProps } from './connector';

export const ChangeLimitsComponent = (props: StateProps & {plan: Plan}) => (
  <div>
    {props.plan ? (
      <p>
        <strong>{translate('Current plan')}</strong>:{' '}
        {props.plan.name}
      </p>
    ) : (
      <p>{translate('Resource does not have any plan.')}</p>
    )}
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>{translate('Name')}</th>
          <th>{translate('Usage')}</th>
          <th>{translate('Current limit')}</th>
          <th>{translate('New limit')}</th>
          {props.periods.map((period, index) => (
            <th className="col-sm-1" key={index}>
              {period}
              <PriceTooltip/>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.components.map((component, index) => (
          <tr key={index}>
            <td>{component.name}</td>
            <td>{component.usage}</td>
            <td>{component.limit}</td>
            <td>
            <div className="input-group">
              <Field
                name={`limits.${component.type}`}
                component="input"
                className="form-control"
                type="number"
                min={0}
                parse={parseIntField}
                format={formatIntField}
              />
              <span className="input-group-addon">
                {component.measured_unit}
              </span>
            </div>
            </td>
            {component.prices.map((price, innerIndex) => (
              <td key={innerIndex}>
                {defaultCurrency(price)}
              </td>
            ))}
          </tr>
        ))}
        <tr>
          <td colSpan={4}>
            {translate('Total')}
          </td>
          {props.totalPeriods.map((price, index) => (
            <td key={index}>
              {defaultCurrency(price)}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
);
