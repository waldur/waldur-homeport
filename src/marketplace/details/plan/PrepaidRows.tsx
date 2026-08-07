import { useMemo } from 'react';
import { Field } from 'react-final-form';

import { defaultCurrency } from '@/core/formatCurrency';
import { composeValidators } from '@/core/validators';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { formatIntField, parseIntField } from '@/marketplace/common/utils';
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
              {translate('Quantity')}:{' '}
              {component.displayAmount ?? component.amount}
              {component.measured_unit ? ` ${component.measured_unit}` : 'x'}
            </span>
          ) : (
            <Field
              name={`limits.${component.type}`}
              parse={parseIntField}
              format={formatIntField}
              validate={validateValue}
              render={({ input }) => (
                <MeasuredUnitInput input={input} component={component} />
              )}
            />
          )
        }
        actions={
          <>
            <span className="d-block">
              {translate('Total')}: {cost.total}
            </span>
            {cost.details && (
              <span className="fw-normal text-muted">{cost.details}</span>
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
            <span className="text-muted">
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
