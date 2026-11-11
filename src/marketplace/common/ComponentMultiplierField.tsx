import { useCallback, useEffect, useRef, useState } from 'react';
import { OptionField } from 'waldur-js-client';

import { FormText, NumberInput } from 'waldur-ui';

import { FormField } from '@/form/types';
import { translate } from '@/i18n';
import { getLimitFieldError } from '@/marketplace/details/plan/MeasuredUnitInput';

import { useOrderFormData } from '../deploy/selectors';

interface ComponentMultiplierFieldProps extends FormField {
  field: OptionField;
}

export const ComponentMultiplierField = ({
  field,
  input,
  meta,
  tooltip,
}: ComponentMultiplierFieldProps) => {
  const fieldValue = input?.value || '';
  const [localValue, setLocalValue] = useState<string>(fieldValue);
  const [isUserEditing, setIsUserEditing] = useState(false);

  const config = field.component_multiplier_config;
  const inputRef = useRef(input);
  inputRef.current = input;

  // Watch form values to detect limit changes
  const formValues = useOrderFormData();
  const currentLimit = config
    ? formValues?.limits?.[config.component_type]
    : null;
  const prevLimitRef = useRef(currentLimit);

  // Sync external changes to local state
  useEffect(() => {
    setLocalValue(fieldValue);
  }, [fieldValue]);

  // Update multiplier field when limit changes externally (not from user input)
  useEffect(() => {
    // Only update if user is not actively editing and limit actually changed
    if (
      !isUserEditing &&
      config &&
      currentLimit !== undefined &&
      currentLimit !== null &&
      currentLimit !== prevLimitRef.current
    ) {
      const calculatedMultiplier = Math.round(currentLimit * config.factor);
      setLocalValue(calculatedMultiplier.toString());
      if (inputRef.current?.onChange) {
        inputRef.current.onChange(calculatedMultiplier.toString());
      }
    }
    prevLimitRef.current = currentLimit;
  }, [currentLimit, config, isUserEditing]);

  // Every keystroke is kept: a value is typed a digit at a time, so its
  // first digits are often below min_limit. NumberInput shows an
  // out-of-range value as invalid and clamps it when the field is left
  // (which comes back through here as a number).
  const handleChange = useCallback((newValue: number | string) => {
    setIsUserEditing(true);
    const text = String(newValue);
    setLocalValue(text);
    if (inputRef.current?.onChange) {
      inputRef.current.onChange(text);
    }
  }, []);

  // Focus and blur reach the form too: a value it rejects that blur cannot
  // clamp (25.5 in 10..50) is only shown once the field is touched.
  const handleBlur = useCallback(() => {
    setIsUserEditing(false);
    inputRef.current?.onBlur?.();
  }, []);

  const handleFocus = useCallback(() => {
    setIsUserEditing(true);
    inputRef.current?.onFocus?.();
  }, []);

  const getHelpText = () => {
    if (!config) return null;

    const parts = [];

    parts.push(
      translate('Calculated as {component} limit × {factor}', {
        factor: config.factor.toLocaleString(),
        component: config.component_type,
      }),
    );

    if (currentLimit !== undefined && currentLimit !== null) {
      parts.push(
        translate('({limit} × {factor} = {result})', {
          limit: currentLimit.toLocaleString(),
          factor: config.factor.toLocaleString(),
          result: (currentLimit * config.factor).toLocaleString(),
        }),
      );
    }

    if (config.min_limit !== undefined || config.max_limit !== undefined) {
      const min = config.min_limit || 0;
      const max = config.max_limit || '∞';
      parts.push(translate('Override range: {min} - {max}', { min, max }));
    }

    return parts.join(' ');
  };

  return (
    <div>
      {tooltip && (
        <FormText as="div" variant="muted" className="mb-2.5">
          {tooltip}
        </FormText>
      )}
      <div>
        <NumberInput
          value={localValue}
          onValueChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={translate('Enter value')}
          min={config?.min_limit}
          max={config?.max_limit}
          step={1}
          showSteppers={false}
          invalid={Boolean(getLimitFieldError(meta))}
        />
        {config && (
          <FormText as="div" variant="muted" className="mt-1">
            {getHelpText()}
          </FormText>
        )}
      </div>
    </div>
  );
};
