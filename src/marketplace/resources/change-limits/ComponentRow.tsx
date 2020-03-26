import * as React from 'react';
import { Field } from 'redux-form';

import { defaultCurrency } from '@waldur/core/services';
import { Limits } from '@waldur/marketplace/common/registry';
import {
  parseIntField,
  formatIntField,
} from '@waldur/marketplace/common/utils';
import { getResourceComponentValidator } from '@waldur/marketplace/offerings/store/limits';

import { ComponentRowType } from './connector';

interface Props {
  component: ComponentRowType;
  limits: Limits;
}

const CellWrapper = props => (
  <td className={props.meta.error ? 'form-group has-error' : 'form-group'}>
    <div className="input-group">
      <input
        className="form-control"
        type="number"
        min={props.limits.min}
        max={props.limits.max}
        {...props.input}
      />
      <span className="input-group-addon">
        {props.offeringComponent.measured_unit}
      </span>
    </div>
  </td>
);

export const ComponentRow: React.FC<Props> = ({ component, limits }) => (
  <tr>
    <td>
      <p className="form-control-static">{component.name}</p>
    </td>
    <td>
      <p className="form-control-static">{component.usage || 'N/A'}</p>
    </td>
    <td>
      <p className="form-control-static">{component.limit || 'N/A'}</p>
    </td>
    <Field
      name={`limits.${component.type}`}
      parse={parseIntField}
      format={formatIntField}
      validate={getResourceComponentValidator(limits)}
      component={CellWrapper}
      offeringComponent={component}
      limits={limits}
    />
    {component.prices.map((price, innerIndex) => (
      <td key={innerIndex}>{defaultCurrency(price)}</td>
    ))}
  </tr>
);
