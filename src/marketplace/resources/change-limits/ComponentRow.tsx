import { CaretDownIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { Field as FinalFormField } from 'react-final-form';
import { useBoolean } from 'react-use';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { composeValidators } from '@/core/validators';
import { NumberField } from '@/form';
import { Limits } from '@/marketplace/common/types';
import { parseIntField, formatIntField } from '@/marketplace/common/utils';
import { getResourceComponentValidator } from '@/marketplace/offerings/store/limits';
import { ChangedLimitField } from '@/marketplace/resources/change-limits/ChangedLimitField';
import { PriceField } from '@/marketplace/resources/change-limits/PriceField';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { renderFieldOrDash } from '@/table/utils';

import { ComponentRowType } from './utils';

interface ComponentRowProps {
  shouldConcealPrices: boolean;
  component: ComponentRowType;
  limits: Limits;
  periods: string[];
  periodsCountToShow: number;
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
  periods,
  periodsCountToShow,
  parentName,
}) => {
  const [toggled, setToggle] = useBoolean(false);
  const canExpand = component.prices.length > periodsCountToShow;

  return (
    <>
      <tr
        onClick={setToggle}
        className={toggled && canExpand ? 'expanded' : undefined}
        data-testid={`row-${component.type}`}
      >
        <td className="text-nowrap">
          {canExpand && (
            <span className={toggled ? 'me-2 active' : 'me-2'}>
              <CaretDownIcon size={20} weight="bold" className="rotate-180" />
            </span>
          )}
          {component.name}
        </td>
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
