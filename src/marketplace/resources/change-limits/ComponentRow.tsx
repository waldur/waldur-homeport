import { CaretDownIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { useBoolean } from 'react-use';
import { Field as FormField } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { Limits } from '@waldur/marketplace/common/types';
import {
  parseIntField,
  formatIntField,
} from '@waldur/marketplace/common/utils';
import { getResourceComponentValidator } from '@waldur/marketplace/offerings/store/limits';
import { ChangedLimitField } from '@waldur/marketplace/resources/change-limits/ChangedLimitField';
import { PriceField } from '@waldur/marketplace/resources/change-limits/PriceField';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

import { ComponentRowType } from './connector';

interface ComponentRowProps {
  shouldConcealPrices: boolean;
  component: ComponentRowType;
  limits: Limits;
  periods: string[];
  periodsCountToShow: number;
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

export const ComponentRow: FC<ComponentRowProps> = ({
  component,
  limits,
  shouldConcealPrices,
  periods,
  periodsCountToShow,
}) => {
  const [toggled, setToggle] = useBoolean(false);
  const canExpand = component.prices.length > periodsCountToShow;

  return (
    <>
      <tr
        onClick={setToggle}
        className={toggled && canExpand ? 'expanded' : undefined}
      >
        <td className="text-nowrap">
          {canExpand && (
            <span className={toggled ? 'me-2 active' : 'me-2'}>
              <CaretDownIcon size={20} weight="bold" className="rotate-180" />
            </span>
          )}
          {component.name}
        </td>
        <td>{component.usage || 'N/A'}</td>
        <td>{component.limit || 'N/A'}</td>
        <FormField
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
          : component.prices.slice(0, periodsCountToShow).map((price, i) => (
              <td key={i}>
                <PriceField
                  price={price}
                  changedPrice={component.changedPrices[i]}
                />
              </td>
            ))}
      </tr>
      {toggled && canExpand && !shouldConcealPrices && (
        <tr>
          <td colSpan={12}>
            <ExpandableContainer>
              {component.prices.map((price, i) =>
                i >= periodsCountToShow ? (
                  <Field
                    key={i}
                    label={periods[i]}
                    value={
                      <PriceField
                        price={price}
                        changedPrice={component.changedPrices[i]}
                      />
                    }
                  />
                ) : null,
              )}
            </ExpandableContainer>
          </td>
        </tr>
      )}
    </>
  );
};
