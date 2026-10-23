import { useMemo } from 'react';
import { Field } from 'react-final-form';

import { defaultCurrency } from '@/core/formatCurrency';
import { composeValidators } from '@/core/validators';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import {
  formatComponentQuantity,
  formatQuantityLabel,
} from '@/marketplace/common/componentQuantity';
import { formatMonthCount } from '@/marketplace/common/prepaidTotalDisplay';
import { formatIntField, getLimitParser } from '@/marketplace/common/utils';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { getOfferingComponentValidator } from '@/marketplace/offerings/store/limits';

import { ComponentCost } from './ComponentCost';
import { MeasuredUnitInput } from './MeasuredUnitInput';
import { Component } from './types';
import { getPrepaidCostParts } from './utils';

const PrepaidRow = ({
  component,
  overageComponent,
  viewMode,
}: {
  component: Component;
  overageComponent?: Component;
  /** Read-only surfaces (proposal resource requests, public plan details). */
  viewMode?: boolean;
}) => {
  const formData = useOrderFormData();
  const endDate = formData?.attributes?.end_date;
  const startDate = formData?.start_date;
  const cost = getPrepaidCostParts(component, endDate, startDate);
  const validate = useMemo(
    () => getOfferingComponentValidator(component),
    [component.min_value, component.max_value],
  );
  const validateValue = composeValidators(...validate);
  // The figure entered is per month; an offering that shows prepaid limits as
  // one total says beside it what the subscription adds up to.
  const totalHint = component.showTotalAmount ? (
    <span className="block font-normal text-quaternary">
      {translate('Total for {months}: {total}', {
        months: formatMonthCount(component.durationInMonths),
        total: formatComponentQuantity(component.amount, component),
      })}
    </span>
  ) : null;

  return (
    <>
      <FormTable.Item
        key={component.type}
        label={component.name}
        description={<ComponentCost component={component} />}
        value={
          // Every other row honours viewMode; this one did not, so a read-only
          // proposal showed an editable box bound to a form nothing submits —
          // and it read 0 regardless of the quantity actually requested.
          // displayAmount is the requested figure before the duration
          // multiplier, which is what the total beside it already accounts for.
          viewMode ? (
            <span>
              {formatQuantityLabel(
                component.displayAmount ?? component.amount,
                component,
              )}
              {totalHint}
            </span>
          ) : (
            <>
              <Field
                name={`limits.${component.type}`}
                parse={getLimitParser(component)}
                format={formatIntField}
                validate={validateValue}
                render={({ input, meta }) => (
                  <MeasuredUnitInput
                    input={input}
                    meta={meta}
                    component={component}
                  />
                )}
              />
              {totalHint}
            </>
          )
        }
        actions={
          <>
            <span className="block">
              {translate('Total')}: {cost.total}
            </span>
            {cost.details && (
              <span className="font-normal text-quaternary">
                {cost.details}
              </span>
            )}
          </>
        }
      />
      {overageComponent && (
        <FormTable.Item
          label={overageComponent.name}
          description={
            overageComponent.measured_unit
              ? translate('Cost: {price} per {unit}', {
                  price: defaultCurrency(overageComponent.price),
                  unit: overageComponent.measured_unit,
                })
              : translate('Cost: {price}', {
                  price: defaultCurrency(overageComponent.price),
                })
          }
          value={
            <span className="text-quaternary">
              {translate('Usage beyond prepaid amount')}
            </span>
          }
        />
      )}
    </>
  );
};

export const PrepaidRows = (props: {
  components: Component[];
  overageComponents?: Component[];
  viewMode?: boolean;
}) => {
  return (
    <>
      {props.components.map((component) => (
        <PrepaidRow
          key={component.type}
          component={component}
          viewMode={props.viewMode}
          overageComponent={props.overageComponents?.find(
            (o) => o.type === component.overage_component,
          )}
        />
      ))}
    </>
  );
};
