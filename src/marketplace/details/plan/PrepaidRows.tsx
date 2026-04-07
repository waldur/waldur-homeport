import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

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
          <tr key={component.type}>
            <td>
              <div className="title fw-bolder">{component.name}</div>
              <div className="description fw-normal">
                <ComponentCost component={component} />
              </div>
            </td>
            <td>
              <Field
                name={`limits.${component.type}`}
                component={MeasuredUnitInput}
                props={{ component }}
              />
            </td>
            <td>
              <div className="fw-bolder">
                {translate('Total')}: {cost.total}
              </div>
              {cost.details && (
                <div className="fw-normal text-muted">{cost.details}</div>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
};
