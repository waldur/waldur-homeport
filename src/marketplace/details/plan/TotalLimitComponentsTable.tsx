import { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { formatCurrency } from '@waldur/core/formatCurrency';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import {
  formatIntField,
  parseIntField,
} from '@waldur/marketplace/common/utils';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

import { Component } from './types';

interface TotalLimitComponentsTableProps {
  components: Component[];
  total: number;
  viewMode: boolean;
}

export const TotalLimitComponentsTable: FunctionComponent<
  TotalLimitComponentsTableProps
> = (props) => {
  const shouldConcealPrices = useSelector((state: RootState) =>
    isVisible(state, MarketplaceFeatures.conceal_prices),
  );
  return (
    <Table className="table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer">
      <thead>
        <tr className="text-start text-muted bg-light fw-bolder fs-7 text-uppercase gs-0">
          <th className="col-sm-1">{translate('Component name')}</th>
          <th className="col-sm-1">{translate('Unit')}</th>
          <th className="col-md-2 col-sm-3">{translate('Quantity')}</th>
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
              {props.viewMode ? (
                component.amount
              ) : (
                <Field
                  name={`limits.${component.type}`}
                  component={InputField}
                  type="number"
                  parse={parseIntField}
                  format={formatIntField}
                  className="px-2"
                />
              )}
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
