import { FC, useMemo } from 'react';
import { Field } from 'react-final-form';
import { BasePublicPlan } from 'waldur-js-client';

import { FormField, NumberInput, Switch } from 'waldur-ui';

import { ENV } from '@/core/config';
import { composeValidators } from '@/core/validators';
import { translate } from '@/i18n';
import { Limits } from '@/marketplace/common/types';
import {
  formatIntField,
  getLimitParser,
  getLimitStep,
} from '@/marketplace/common/utils';
import { getResourceComponentValidator } from '@/marketplace/offerings/store/limits';
import { OfferingLimits } from '@/marketplace/offerings/store/types';
import { ChangedLimitField } from '@/marketplace/resources/change-limits/ChangedLimitField';
import { renderFieldOrDash } from '@/table/utils';

interface ComponentRowProps {
  component: {
    type: string;
    name: string;
    measured_unit: string;
    is_boolean: boolean;
    limit: number;
    usage: number;
    changedLimit: number;
    limit_decimal_places?: number | null;
  };
  limits: Limits;
  offeringLimits: OfferingLimits;
  plan: BasePublicPlan;
  secondaryMultiplier?: number;
}

const CellWrapper: FC<any> = (props) => {
  const currentLimit = props.currentLimit || 0;
  const step = getLimitStep(props.offeringComponent);
  const parse = getLimitParser(props.offeringComponent);

  // The typed text, or the number a stepper click produced (NumberInput
  // already rounds that to the step's precision and keeps it in range).
  const handleChange = (next: string | number) => {
    const inputValue = String(next);
    if (inputValue === '') {
      props.input.onChange('');
      return;
    }
    const parsed = parse(inputValue);
    // A value still being typed through ("1.", "1.0") is passed along as it
    // stands: clamping it would parse away the character the user just typed.
    if (typeof parsed === 'string') {
      props.input.onChange(parsed);
      return;
    }
    if (Number.isFinite(parsed)) {
      props.input.onChange(Math.max(0, Math.min(currentLimit, parsed)));
    }
  };

  return (
    <FormField as="td" onClick={(e) => e.stopPropagation()}>
      {props.offeringComponent.is_boolean ? (
        <Switch
          label=""
          checked={parseInt(props.input.value) === 1}
          onCheckedChange={(value) => props.input.onChange(value ? 1 : 0)}
        />
      ) : (
        <NumberInput
          name={`row-${props.offeringComponent.type}-input`}
          aria-label={translate('Limit for {component}', {
            component: props.offeringComponent.name,
          })}
          data-testid={`row-${props.offeringComponent.type}-input`}
          step={step}
          min={props.limits?.min || 0}
          max={currentLimit}
          value={props.input.value}
          onValueChange={handleChange}
          onBlur={props.input.onBlur}
        />
      )}
    </FormField>
  );
};

export const ComponentRow: FC<ComponentRowProps> = ({
  component,
  limits,
  plan,
  secondaryMultiplier = 12,
}) => {
  const price = Number(plan?.prices?.[component.type]) || 0;
  const pricePerMonth = Number(price) || 0;
  const pricePerSecondary = pricePerMonth * secondaryMultiplier;

  const baseValidators = getResourceComponentValidator(limits);
  const currentLimitValidator = (value: number) => {
    const numValue = parseFloat(String(value));
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
  const validate = useMemo(
    () => composeValidators(...baseValidators, currentLimitValidator),
    [baseValidators, currentLimitValidator],
  );

  return (
    <tr data-testid={`row-${component.type}`}>
      <td className="text-nowrap">{component.name}</td>
      <td>{renderFieldOrDash(component.limit)}</td>
      <Field
        name={`limits.${component.type}`}
        parse={getLimitParser(component)}
        format={formatIntField}
        validate={validate}
        min={0}
        component={CellWrapper}
        offeringComponent={component}
        limits={limits}
        currentLimit={component.limit}
      />
      <td>
        <ChangedLimitField changedLimit={component.changedLimit} />
      </td>
      <td>
        {ENV.plugins.WALDUR_CORE.CURRENCY_NAME} {pricePerMonth.toFixed(2)}
      </td>
      <td>
        {ENV.plugins.WALDUR_CORE.CURRENCY_NAME} {pricePerSecondary.toFixed(2)}
      </td>
    </tr>
  );
};
