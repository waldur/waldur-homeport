import React, { FunctionComponent } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { Field } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { Limits } from '@waldur/marketplace/common/registry';
import {
  parseIntField,
  formatIntField,
} from '@waldur/marketplace/common/utils';
import { getResourceComponentValidator } from '@waldur/marketplace/offerings/store/limits';
import { ChangedLimitField } from '@waldur/marketplace/resources/change-limits/ChangedLimitField';
import { PriceField } from '@waldur/marketplace/resources/change-limits/PriceField';

import { ComponentRowType } from './connector';

interface ComponentRowProps {
  shouldConcealPrices: boolean;
  component: ComponentRowType;
  limits: Limits;
}

const CellWrapper: FunctionComponent<any> = (props) => (
  <Form.Group as="td">
    {props.offeringComponent.is_boolean ? (
      <AwesomeCheckbox
        label=""
        value={parseInt(props.input.value) === 1}
        onChange={(value) => props.input.onChange(value ? 1 : 0)}
      />
    ) : (
      <InputGroup>
        <Form.Control
          type="number"
          min={props.limits.min}
          max={props.limits.max}
          {...props.input}
        />
        {props.offeringComponent.measured_unit ? (
          <InputGroup.Text>
            {props.offeringComponent.measured_unit}
          </InputGroup.Text>
        ) : null}
      </InputGroup>
    )}
  </Form.Group>
);

export const ComponentRow: React.FC<ComponentRowProps> = ({
  component,
  limits,
  shouldConcealPrices,
}) => (
  <tr>
    <td>
      <p>{component.name}</p>
    </td>
    <td>
      <p>{component.usage || 'N/A'}</p>
    </td>
    <td>
      <p>{component.limit || 'N/A'}</p>
    </td>
    <Field
      name={`limits.${component.type}`}
      parse={parseIntField}
      format={formatIntField}
      validate={getResourceComponentValidator(limits)}
      min={0}
      component={CellWrapper}
      offeringComponent={component}
      limits={limits}
    />
    <td>
      <ChangedLimitField changedLimit={component.changedLimit} />
    </td>
    {shouldConcealPrices
      ? null
      : component.prices.map((price, innerIndex) => (
          <td key={innerIndex}>
            <PriceField
              price={price}
              changedPrice={component.changedPrices[innerIndex]}
            />
          </td>
        ))}
  </tr>
);
