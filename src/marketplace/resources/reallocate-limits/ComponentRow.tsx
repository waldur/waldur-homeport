import { FC } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { Field as FormField } from 'redux-form';
import { BasePublicPlan } from 'waldur-js-client';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { CaretUpDownButtons } from '@waldur/core/CaretUpDownButtons';
import { translate } from '@waldur/i18n';
import { Limits } from '@waldur/marketplace/common/types';
import {
  parseIntField,
  formatIntField,
} from '@waldur/marketplace/common/utils';
import { getResourceComponentValidator } from '@waldur/marketplace/offerings/store/limits';
import { OfferingLimits } from '@waldur/marketplace/offerings/store/types';
import { ChangedLimitField } from '@waldur/marketplace/resources/change-limits/ChangedLimitField';

interface ComponentRowProps {
  component: {
    type: string;
    name: string;
    measured_unit: string;
    is_boolean: boolean;
    limit: number;
    usage: number;
    changedLimit: number;
  };
  limits: Limits;
  offeringLimits: OfferingLimits;
  plan: BasePublicPlan;
}

const CellWrapper: FC<any> = (props) => {
  const currentLimit = props.currentLimit || 0;

  const adjustValue = (amount: number) => {
    const currentValue = parseInt(props.input.value, 10) || 0;
    const newValue = Math.max(0, Math.min(currentLimit, currentValue + amount));
    props.input.onChange(newValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      props.input.onChange('');
      return;
    }
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue)) {
      const limitedValue = Math.max(0, Math.min(currentLimit, numValue));
      props.input.onChange(limitedValue);
    }
  };

  return (
    <Form.Group as="td" onClick={(e) => e.stopPropagation()}>
      {props.offeringComponent.is_boolean ? (
        <AwesomeCheckbox
          label=""
          value={parseInt(props.input.value) === 1}
          onChange={(value) => props.input.onChange(value ? 1 : 0)}
        />
      ) : (
        <InputGroup className="input-group-number">
          <Form.Control
            type="number"
            min={props.limits?.min || 0}
            max={currentLimit}
            value={props.input.value}
            onChange={handleChange}
            onBlur={props.input.onBlur}
          />
          <div className="input-group-addons">
            <CaretUpDownButtons
              onClickUp={() => adjustValue(1)}
              onClickDown={() => adjustValue(-1)}
            />
          </div>
        </InputGroup>
      )}
    </Form.Group>
  );
};

export const ComponentRow: FC<ComponentRowProps> = ({
  component,
  limits,
  plan,
}) => {
  const price = Number(plan?.prices?.[component.type]) || 0;
  const pricePerMonth = Number(price) || 0;
  const pricePerYear = pricePerMonth * 12;

  const baseValidators = getResourceComponentValidator(limits);
  const currentLimitValidator = (value: number) => {
    const numValue = parseInt(String(value), 10);
    if (isNaN(numValue)) return undefined;
    if (numValue > component.limit) {
      return translate(
        'Value should not be greater than current limit ({limit}).',
        {
          limit: component.limit,
        },
      );
    }
    return undefined;
  };
  const validators = [...baseValidators, currentLimitValidator];

  return (
    <tr>
      <td className="text-nowrap">{component.name}</td>
      <td>{component.limit || 'N/A'}</td>
      <FormField
        name={`limits.${component.type}`}
        parse={parseIntField}
        format={formatIntField}
        validate={validators}
        min={0}
        component={CellWrapper}
        offeringComponent={component}
        limits={limits}
        currentLimit={component.limit}
      />
      <td>
        <ChangedLimitField changedLimit={component.changedLimit} />
      </td>
      <td>EUR {pricePerMonth.toFixed(2)}</td>
      <td>EUR {pricePerYear.toFixed(2)}</td>
    </tr>
  );
};
