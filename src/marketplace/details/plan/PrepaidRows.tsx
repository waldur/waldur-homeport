import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { defaultCurrency } from '@/core/formatCurrency';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { formatIntField, parseIntField } from '@/marketplace/common/utils';
import { getOfferingComponentValidator } from '@/marketplace/offerings/store/limits';

import { ComponentCost } from './ComponentCost';
import { MeasuredUnitInput } from './MeasuredUnitInput';
import { Component } from './types';
import { getEndDate, getStartDate, getPrepaidCostParts } from './utils';

const PrepaidRow = ({
  component,
  overageComponent,
}: {
  component: Component;
  overageComponent?: Component;
}) => {
  const endDate = useSelector(getEndDate);
  const startDate = useSelector(getStartDate);
  const cost = getPrepaidCostParts(component, endDate, startDate);
  const validate = useMemo(
    () => getOfferingComponentValidator(component),
    [component.min_value, component.max_value],
  );

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
            validate={validate}
            component={MeasuredUnitInput}
            props={{ component }}
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
