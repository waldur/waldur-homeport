import { Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { formatCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import {
  formatIntField,
  parseIntField,
} from '@waldur/marketplace/common/utils';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

import { Component } from './types';

export const TotalLimitComponentsTable = (props: {
  components: Component[];
  total: number;
}) => {
  const shouldConcealPrices = useSelector((state: RootState) =>
    isVisible(state, 'marketplace.conceal_prices'),
  );
  return (
    <Table bordered={true}>
      <thead>
        <tr>
          <th className="col-sm-1">{translate('Component name')}</th>
          <th className="col-sm-1">{translate('Unit')}</th>
          <th className="col-sm-1">{translate('Quantity')}</th>
          {!shouldConcealPrices && (
            <th>
              {translate('Price per unit')}
              <PriceTooltip />
            </th>
          )}
          <th>{translate('Subtotal')}</th>
        </tr>
      </thead>
      <tbody>
        {props.components.map((component, index) => (
          <tr key={index}>
            <td>{component.name}</td>
            <td>{component.measured_unit || 'N/A'}</td>
            <td>
              <Field
                name={`limits.${component.type}`}
                component="input"
                type="number"
                parse={parseIntField}
                format={formatIntField}
                className="form-control"
              />
            </td>
            {!shouldConcealPrices && (
              <td>
                {formatCurrency(
                  component.price,
                  ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                  4,
                )}
              </td>
            )}
            <td>
              {formatCurrency(
                component.subTotal,
                ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                4,
              )}
            </td>
          </tr>
        ))}
        <tr>
          <td colSpan={3}>{translate('Total')}</td>
          <td>
            {formatCurrency(
              props.total,
              ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
              4,
            )}
          </td>
        </tr>
      </tbody>
    </Table>
  );
};
