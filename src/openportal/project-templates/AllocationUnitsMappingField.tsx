import React, { useState, FunctionComponent, useCallback } from 'react';

import { BaseButton, FormField, FormLabel } from 'waldur-ui';

import { FieldError } from '@/form/FieldError';
import { BaseInputField } from '@/form/InputField';
import { Select } from '@/form/select';
import { FormField as FormFieldProps } from '@/form/types';
import { translate } from '@/i18n';

const AllocationUnitsOptions = [
  {
    label: translate('Node Hour'),
    value: 'NHR',
  },
  {
    label: translate('CPU Hour'),
    value: 'CPUHR',
  },
  {
    label: translate('Core Hour'),
    value: 'COREHR',
  },
  {
    label: translate('GPU Hour'),
    value: 'GPUHR',
  },
  {
    label: translate('Memory GB Hour'),
    value: 'GBHR',
  },
];

interface AllocationMapping {
  [unit: string]: number;
}

interface AllocationUnitsMappingProps extends FormFieldProps {
  placeholder?: string;
  validator?: any;
  solid?: boolean;
}

export const AllocationUnitsMappingField: FunctionComponent<
  AllocationUnitsMappingProps
> = ({ input, solid, meta }) => {
  const [allocationUnit, setAllocationUnit] = useState<string | null>(null);
  const [allocationValue, setAllocationValue] = useState<number | null>(null);

  const addMapping = useCallback(() => {
    if (allocationUnit && allocationValue && allocationValue > 0) {
      const currentMappings: AllocationMapping = input.value || {};
      const newMappings = {
        ...currentMappings,
        [allocationUnit]: allocationValue,
      };

      input.onChange(newMappings);
      setAllocationUnit(null);
      setAllocationValue(null);
    }
  }, [allocationUnit, allocationValue, input]);

  const removeMapping = useCallback(
    (unit: string) => {
      const currentMappings: AllocationMapping = input.value || {};
      if (currentMappings[unit]) {
        const { [unit]: _, ...remainingMappings } = currentMappings;
        input.onChange(remainingMappings);
      }
    },
    [input],
  );

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setAllocationValue(value === '' ? null : Number(value));
    },
    [],
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addMapping();
      }
    },
    [addMapping],
  );

  const currentMappings: AllocationMapping = input.value || {};
  const hasMappings = Object.keys(currentMappings).length > 0;
  const isAddButtonEnabled =
    allocationUnit && allocationValue && allocationValue > 0;

  const hasError = meta?.touched && meta?.error;

  return (
    <div>
      <div className="mb-2.5">
        {hasMappings ? (
          <>
            <div className="text-quaternary mb-1.5">
              {translate('Current mappings:')}
            </div>
            <ul className="list-group mb-2.5">
              {Object.entries(currentMappings).map(([unit, value]) => (
                <li
                  key={unit}
                  className="list-group-item flex justify-between items-center"
                >
                  <span>
                    {translate('1 credit equals')} {value} {unit}
                  </span>
                  <BaseButton
                    variant="danger"
                    size="sm"
                    onClick={() => removeMapping(unit)}
                    tooltip={translate('Remove mapping for {{unit}}', {
                      unit,
                    })}
                    label={translate('Remove')}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="text-quaternary mb-2.5">
            {translate('No mappings added yet.')}
          </div>
        )}

        <div className="text-quaternary mb-1.5">
          {translate('Add a new mapping:')}
        </div>

        <div className="row mb-2.5 items-end">
          <FormField className="col-md-5">
            <FormLabel className="sr-only">
              {translate('Allocation Unit')}
            </FormLabel>
            <Select
              value={
                AllocationUnitsOptions.find(
                  (option) => option.value === allocationUnit,
                ) || null
              }
              onChange={(option) => setAllocationUnit(option?.value || null)}
              options={AllocationUnitsOptions}
              onBlur={input.onBlur}
              placeholder={translate('Select unit...')}
              aria-label={translate('Select allocation unit')}
              isSearchable={false}
            />
          </FormField>
          <FormField className="col-md-5">
            <FormLabel className="sr-only">
              {translate('Allocation Value')}
            </FormLabel>
            <BaseInputField
              solid={solid}
              isInvalid={Boolean(hasError)}
              type="number"
              value={allocationValue ?? ''}
              onChange={handleValueChange}
              onKeyDown={handleKeyPress}
              placeholder={translate('e.g., 4')}
              step="0.5"
              min="0"
              aria-label={translate('Enter allocation value')}
            />
          </FormField>
          <div className="col-md-2">
            <BaseButton
              type="button"
              size="sm"
              variant={isAddButtonEnabled ? 'primary' : 'tertiary'}
              onClick={addMapping}
              disabled={!isAddButtonEnabled}
              disabledReason={translate(
                'Select a unit and enter a value first',
              )}
              aria-label={translate('Add allocation mapping')}
              label={translate('Add')}
            />
          </div>
        </div>

        {/* Display validation errors */}
        {hasError && <FieldError error={meta.error} />}
      </div>
    </div>
  );
};
