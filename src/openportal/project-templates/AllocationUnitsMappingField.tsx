import classNames from 'classnames';
import React, { useState, FunctionComponent, useCallback } from 'react';
import { Form } from 'react-bootstrap';

import { Select } from '@/form/select';
import { FormField } from '@/form/types';
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

interface AllocationUnitsMappingProps extends FormField {
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
    <div className="allocation-units-mapping-field">
      <div className="mb-3">
        {hasMappings ? (
          <>
            <div className="text-muted mb-2">
              {translate('Current mappings:')}
            </div>
            <ul className="list-group mb-3">
              {Object.entries(currentMappings).map(([unit, value]) => (
                <li
                  key={unit}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span>
                    {translate('1 credit equals')} {value} {unit}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removeMapping(unit)}
                    title={translate('Remove mapping')}
                    aria-label={translate('Remove mapping for {{unit}}', {
                      unit,
                    })}
                  >
                    {translate('Remove')}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="text-muted mb-3">
            {translate('No mappings added yet.')}
          </div>
        )}

        <div className="text-muted mb-2">{translate('Add a new mapping:')}</div>

        <div className="row mb-3 align-items-end">
          <div className="col-md-5">
            <Form.Label className="sr-only">
              {translate('Allocation Unit')}
            </Form.Label>
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
          </div>
          <div className="col-md-5">
            <Form.Label className="sr-only">
              {translate('Allocation Value')}
            </Form.Label>
            <Form.Control
              className={classNames(
                solid && 'form-control-solid',
                hasError && 'is-invalid',
              )}
              type="number"
              value={allocationValue ?? ''}
              onChange={handleValueChange}
              onKeyDown={handleKeyPress}
              placeholder={translate('e.g., 4')}
              step="0.5"
              min="0"
              aria-label={translate('Enter allocation value')}
            />
          </div>
          <div className="col-md-2">
            <button
              type="button"
              className={`btn btn-sm ${
                isAddButtonEnabled ? 'btn-primary' : 'btn-outline-secondary'
              }`}
              onClick={addMapping}
              disabled={!isAddButtonEnabled}
              title={translate('Add mapping')}
              aria-label={translate('Add allocation mapping')}
            >
              {translate('Add')}
            </button>
          </div>
        </div>

        {/* Display validation errors */}
        {hasError && (
          <div className="invalid-feedback d-block">{meta.error}</div>
        )}
      </div>
    </div>
  );
};
