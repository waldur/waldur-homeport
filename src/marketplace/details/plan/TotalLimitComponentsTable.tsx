import { FunctionComponent } from 'react';
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
import { NumberField } from '@/form/NumberField';
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
            // Not useMemo: one hook per row makes the hook count follow the
            // list, and React throws as soon as it grows or shrinks (a plan
            // with a different number of total-limited components).
            const validateValue = composeValidators(
              ...getOfferingComponentValidator(component),
            );

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
                        // min: the validator checks min_value only when it is
                        // set, so without it a negative limit went through.
                        <NumberField
                          input={input}
                          meta={meta}
                          step={getLimitStep(component)}
                          min={component.min_value || 0}
                          max={component.max_value}
                          showSteppers={false}
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
