import { FunctionComponent, useMemo } from 'react';
import { Field } from 'react-final-form';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { ENV } from '@/core/config';
import { formatCurrency } from '@/core/formatCurrency';
import { composeValidators } from '@/core/validators';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';
import {
  formatIntField,
  getLimitParser,
  getLimitStep,
} from '@/marketplace/common/utils';
import { getOfferingComponentValidator } from '@/marketplace/offerings/store/limits';
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
    <div className="mb-3">
      <Table density="normal">
        <TableHeader>
          <TableRow>
            <TableHead className="sm:w-1/12">
              {translate('Component name')}
            </TableHead>
            <TableHead className="sm:w-1/12">{translate('Unit')}</TableHead>
            <TableHead className="sm:w-3/12 md:w-2/12">
              {translate('Quantity')}
            </TableHead>
            {!shouldConcealPrices && !props.hidePrices && (
              <TableHead>
                {translate('Price per unit')}
                <PriceTooltip />
              </TableHead>
            )}
            {!props.hidePrices && (
              <TableHead>{translate('Subtotal')}</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.components.map((component, index) => {
            const validate = useMemo(
              () => getOfferingComponentValidator(component),
              [component.min_value, component.max_value],
            );
            const validateValue = composeValidators(...validate);

            return (
              <TableRow key={index}>
                <TableCell className="font-medium text-primary">
                  {component.name}
                </TableCell>
                <TableCell>
                  {renderFieldOrDash(component.measured_unit)}
                </TableCell>
                <TableCell>
                  {props.viewMode ? (
                    component.amount
                  ) : (
                    <Field
                      name={`limits.${component.type}`}
                      parse={getLimitParser(component)}
                      format={formatIntField}
                      validate={validateValue}
                    >
                      {({ input, meta }) => (
                        <InputField
                          input={input}
                          meta={meta}
                          type="number"
                          step={getLimitStep(component)}
                          className="px-1.5"
                        />
                      )}
                    </Field>
                  )}
                </TableCell>
                {!shouldConcealPrices && !props.hidePrices && (
                  <TableCell>
                    {formatCurrency(
                      component.price,
                      ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                      4,
                    )}
                  </TableCell>
                )}
                {!props.hidePrices && (
                  <TableCell>
                    {formatCurrency(
                      component.subTotal,
                      ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                      4,
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          {!props.hidePrices && (
            <TableRow>
              <TableCell colSpan={3} className="font-bold">
                {translate('Total')}
              </TableCell>
              <TableCell className="font-bold">
                {formatCurrency(
                  props.total,
                  ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                  4,
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
