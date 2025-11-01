import { useState, useEffect, useCallback, useRef } from 'react';

import { Select } from '@waldur/form/themed-select';
import { FormField } from '@waldur/form/types';
import { translate } from '@waldur/i18n';

import { FormGroup } from '../offerings/FormGroup';

interface CascadeStep {
  name: string;
  label: string;
  type: string;
  depends_on?: string;
  choices?: Array<{ value: string; label: string }>;
  choices_map?: Record<string, Array<{ value: string; label: string }>>;
}

interface CascadeConfig {
  steps: CascadeStep[];
}

interface ConditionalCascadeFieldProps extends FormField {
  field: {
    cascade_config?: CascadeConfig;
    label?: string;
    help_text?: string;
  };
}

export const ConditionalCascadeField = ({
  field,
  input,
  tooltip,
}: ConditionalCascadeFieldProps) => {
  const fieldValue = input?.value || {};
  const [selections, setSelections] = useState<Record<string, string>>(() =>
    typeof fieldValue === 'object' && fieldValue !== null ? fieldValue : {},
  );

  const steps = field.cascade_config?.steps || [];
  const inputRef = useRef(input);
  inputRef.current = input;

  // Simple sync approach - update local state only when external value changes
  useEffect(() => {
    const currentFieldValue =
      typeof fieldValue === 'object' && fieldValue !== null ? fieldValue : {};
    setSelections(currentFieldValue);
  }, [input?.value]);

  const updateSelection = useCallback(
    (stepName: string, selectedValue: string) => {
      const newSelections = { ...selections, [stepName]: selectedValue };

      // Clear dependent selections when parent changes
      const stepIndex = steps.findIndex((s) => s.name === stepName);
      steps.slice(stepIndex + 1).forEach((step) => {
        delete newSelections[step.name];
      });

      // Update local state and notify form
      setSelections(newSelections);
      if (inputRef.current?.onChange) {
        inputRef.current.onChange(newSelections);
      }
    },
    [selections, steps],
  );

  const getChoicesForStep = (
    step: CascadeStep,
  ): Array<{ value: string; label: string }> => {
    if (step.choices) {
      return step.choices;
    }

    if (step.choices_map && step.depends_on) {
      const parentValue = selections[step.depends_on];
      return step.choices_map[parentValue] || [];
    }

    return [];
  };

  const isStepEnabled = (step: CascadeStep): boolean => {
    if (!step.depends_on) {
      return true;
    }

    const parentValue = selections[step.depends_on];
    return Boolean(parentValue);
  };

  return (
    <div className="conditional-cascade">
      {tooltip && <div className="form-text text-muted mb-3">{tooltip}</div>}
      {steps.map((step) => {
        const isEnabled = isStepEnabled(step);
        const choices = getChoicesForStep(step);
        const currentValue = selections[step.name] || '';

        return (
          <FormGroup key={step.name} label={step.label} className="mb-3">
            <Select
              value={
                choices.find((choice) => choice.value === currentValue) || null
              }
              onChange={(option) =>
                updateSelection(step.name, option?.value || '')
              }
              options={choices}
              isDisabled={!isEnabled}
              isClearable={false}
              placeholder={
                isEnabled
                  ? translate('Select {label}', { label: step.label })
                  : translate('Please select {parent} first', {
                      parent:
                        steps.find((s) => s.name === step.depends_on)?.label ||
                        '',
                    })
              }
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
            />
          </FormGroup>
        );
      })}
    </div>
  );
};
