import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { Field as FinalFormField } from 'react-final-form';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { composeValidators } from '@/core/validators';
import { NumberField } from '@/form';
import { Limits } from '@/marketplace/common/types';
import { parseIntField, formatIntField } from '@/marketplace/common/utils';
import { getResourceComponentValidator } from '@/marketplace/offerings/store/limits';
import { ChangedLimitField } from '@/marketplace/resources/change-limits/ChangedLimitField';
import { PriceField } from '@/marketplace/resources/change-limits/PriceField';
import { renderFieldOrDash } from '@/table/utils';

import { ComponentRowType } from './utils';

interface ComponentRowProps {
  shouldConcealPrices: boolean;
  component: ComponentRowType;
  limits: Limits;
  /** For nested fields */
  parentName?: string;
}

const CellWrapper: FC<any> = (props) => (
  <Form.Group as="td" onClick={(e) => e.stopPropagation()}>
    {props.offeringComponent.is_boolean ? (
      <AwesomeCheckbox
        label=""
        value={parseInt(props.input.value) === 1}
        onChange={(value) => props.input.onChange(value ? 1 : 0)}
      />
    ) : (
      <NumberField
        input={props.input}
        unit={props.offeringComponent.measured_unit}
        min={props.limits.min}
        max={props.limits.max}
      />
    )}
  </Form.Group>
);

export const ComponentRow: FC<ComponentRowProps> = ({
  component,
  limits,
  shouldConcealPrices,
  parentName,
}) => {
  return (
    <tr data-testid={`row-${component.type}`}>
      <td className="text-nowrap">{component.name}</td>
      <td>{renderFieldOrDash(component.usage)}</td>
      <td>{renderFieldOrDash(component.limit)}</td>
      <FinalFormField
        name={`${parentName ? parentName + '.' : ''}limits.${component.type}`}
        parse={parseIntField}
        format={formatIntField}
        validate={composeValidators(...getResourceComponentValidator(limits))}
        min={0}
        component={CellWrapper}
        offeringComponent={component}
        limits={limits}
      />

      <td>
        <ChangedLimitField
          changedLimit={component.changedLimit}
          unit={component.measured_unit}
        />
      </td>
      {shouldConcealPrices ? null : (
        <td>
          <PriceField
            price={component.price}
            changedPrice={component.changedPrice}
            suffix={component.priceSuffix}
          />
        </td>
      )}
    </tr>
  );
};
