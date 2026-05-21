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
}: {
  component: Component;
  overageComponent?: Component;
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
          <Field
            name={`limits.${component.type}`}
            parse={parseIntField}
            format={formatIntField}
            validate={validateValue}
            render={({ input }) => (
              <MeasuredUnitInput input={input} component={component} />
            )}
          />
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
}) => {
  return (
    <>
      {props.components.map((component) => (
        <PrepaidRow
          key={component.type}
          component={component}
          overageComponent={props.overageComponents?.find(
            (o) => o.type === component.overage_component,
          )}
        />
      ))}
    </>
  );
};
