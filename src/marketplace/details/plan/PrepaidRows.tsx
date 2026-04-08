import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';

import { ComponentCost } from './ComponentCost';
import { MeasuredUnitInput } from './MeasuredUnitInput';
import { Component } from './types';
import { getPrepaidCostParts } from './utils';
import { getEndDate } from './utils';

export const PrepaidRows = (props: { components: Component[] }) => {
  const endDate = useSelector(getEndDate);
  return (
    <>
      {props.components.map((component) => {
        const cost = getPrepaidCostParts(component, endDate);
        return (
          <FormTable.Item
            key={component.type}
            label={component.name}
            description={<ComponentCost component={component} />}
            value={
              <Field
                name={`limits.${component.type}`}
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
        );
      })}
    </>
  );
};
