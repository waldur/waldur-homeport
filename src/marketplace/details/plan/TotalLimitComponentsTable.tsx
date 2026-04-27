import { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';
import { Field } from 'redux-form';

import { ENV } from '@/core/config';
import { formatCurrency } from '@/core/formatCurrency';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { formatIntField, parseIntField } from '@/marketplace/common/utils';
import { PriceTooltip } from '@/price/PriceTooltip';
import { renderFieldOrDash } from '@/table/utils';

import { Component } from './types';

interface TotalLimitComponentsTableProps {
  components: Component[];
  total: number;
  viewMode: boolean;
  hidePrices?: boolean;
}

export const TotalLimitComponentsTable: FunctionComponent<
  TotalLimitComponentsTableProps
> = (props) => {
  const shouldConcealPrices = isFeatureVisible(
    MarketplaceFeatures.conceal_prices,
  );
  return (
    <Table className="table align-middle table-row-bordered fs-6 gy-4 no-footer">
      <thead>
        <tr className="align-middle">
          <th className="col-sm-1">{translate('Component name')}</th>
          <th className="col-sm-1">{translate('Unit')}</th>
          <th className="col-md-2 col-sm-3">{translate('Quantity')}</th>
          {!shouldConcealPrices && !props.hidePrices && (
            <th>
              {translate('Price per unit')}
              <PriceTooltip />
            </th>
          )}
          {!props.hidePrices && <th>{translate('Subtotal')}</th>}
        </tr>
      </thead>
      <tbody>
        {props.components.map((component, index) => (
          <tr key={index}>
            <td>{component.name}</td>
            <td>{renderFieldOrDash(component.measured_unit)}</td>
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
            {!shouldConcealPrices && !props.hidePrices && (
              <td>
                {formatCurrency(
                  component.price,
                  ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                  4,
                )}
              </td>
            )}
            {!props.hidePrices && (
              <td>
                {formatCurrency(
                  component.subTotal,
                  ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                  4,
                )}
              </td>
            )}
          </tr>
        ))}
        {!props.hidePrices && (
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
        )}
      </tbody>
    </Table>
  );
};
