import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { OptionField } from 'waldur-js-client';

import { FormField } from '@/form/types';
import { translate } from '@/i18n';

import { orderFormDataSelector } from '../deploy/selectors';

interface ComponentMultiplierFieldProps extends FormField {
  field: OptionField;
}

export const ComponentMultiplierField = ({
  field,
  input,
  tooltip,
}: ComponentMultiplierFieldProps) => {
  const fieldValue = input?.value || '';
  const [localValue, setLocalValue] = useState<string>(fieldValue);
  const [isUserEditing, setIsUserEditing] = useState(false);

  const config = field.component_multiplier_config;
  const inputRef = useRef(input);
  inputRef.current = input;

  // Watch form values to detect limit changes
  const formValues = useSelector(orderFormDataSelector);
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

  // Handle user input with validation (but don't auto-update limits)
  const handleChange = useCallback(
    (newValue: string) => {
      setIsUserEditing(true);
      const numValue = parseInt(newValue, 10);

      // Validate against min/max limits if configured
      if (config && !isNaN(numValue)) {
        if (config.min_limit !== undefined && numValue < config.min_limit) {
          return;
        }
        if (config.max_limit !== undefined && numValue > config.max_limit) {
          return;
        }
      }

      setLocalValue(newValue);
      if (inputRef.current?.onChange) {
        inputRef.current.onChange(newValue);
      }
    },
    [config],
  );

  const handleBlur = useCallback(() => {
    setIsUserEditing(false);
  }, []);

  const handleFocus = useCallback(() => {
    setIsUserEditing(true);
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
    <div className="component-multiplier-field">
      {tooltip && <div className="form-text text-muted mb-3">{tooltip}</div>}
      <div className="form-group">
        <input
          type="number"
          className="form-control"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={translate('Enter value')}
          min={config?.min_limit}
          max={config?.max_limit}
        />
        {config && (
          <div className="form-text text-muted mt-1">{getHelpText()}</div>
        )}
      </div>
    </div>
  );
};
