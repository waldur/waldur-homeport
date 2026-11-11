import {
  ArrowCounterClockwiseIcon,
  TrendDownIcon,
  TrendUpIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useCallback, useEffect, useState } from 'react';

import {
  FormField,
  FormLabel,
  HelpIcon,
  NativeSelect,
  NumberInput,
  RangeInput,
  Tooltip,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { SimulationParam, SimulationResult } from './types';
import { formatSimulationChange, useSimulation } from './useSimulation';

interface WhatIfSimulatorProps {
  /** Configuration of adjustable parameters */
  params: SimulationParam[];
  /** Function to calculate results */
  calculate: (
    params: Record<string, number | string>,
    data: unknown,
  ) => SimulationResult[];
  /** Data to use in calculations */
  data: unknown;
}

/**
 * Single parameter input control
 */
const ParamInput: FC<{
  param: SimulationParam;
  value: number | string;
  onChange: (value: number | string) => void;
}> = ({ param, value, onChange }) => {
  const numValue =
    typeof value === 'number' ? value : parseFloat(value as string) || 0;

  const handleChange = useCallback(
    (newValue: number) => {
      const min = param.min ?? -Infinity;
      const max = param.max ?? Infinity;
      const clamped = Math.max(min, Math.min(max, newValue));
      onChange(clamped);
    },
    [param.min, param.max, onChange],
  );

  const step = param.step ?? 1;

  if (param.type === 'select' && param.options) {
    return (
      <NativeSelect
        containerClassName="w-1/2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {param.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </NativeSelect>
    );
  }

  if (param.type === 'slider') {
    const min = param.min ?? 0;
    const max = param.max ?? 100;

    return (
      <div className="flex items-center gap-2.5">
        <RangeInput
          value={numValue}
          min={min}
          max={max}
          step={step}
          onChange={(e) => handleChange(parseFloat(e.target.value))}
          className="flex-1"
        />
        <span className="whitespace-nowrap min-w-15">
          {numValue}
          {param.unit && (
            <span className="text-quaternary ms-1">{param.unit}</span>
          )}
        </span>
      </div>
    );
  }

  return <NumberParamInput param={param} value={value} onChange={onChange} />;
};

/**
 * A number parameter. The text being typed stays here: only a number in the
 * parameter's range reaches the simulation, so typing 75 into a field with
 * min 50 never runs it on 7 (nor snaps the 7 up to 50, which made the value
 * impossible to type). An out-of-range entry shows invalid and is clamped
 * when the field is left; an emptied one goes back to the current value.
 */
const NumberParamInput: FC<{
  param: SimulationParam;
  value: number | string;
  onChange: (value: number | string) => void;
}> = ({ param, value, onChange }) => {
  const [text, setText] = useState<number | string>(value);

  // Follow a value set from outside (Reset), but not the echo of what was
  // just typed, or "0." would turn into "0" mid-entry.
  useEffect(() => {
    if (parseFloat(String(text)) !== Number(value)) {
      setText(value);
    }
  }, [value]);

  const handleValueChange = (next: number | string) => {
    setText(next);
    const num = typeof next === 'number' ? next : parseFloat(next);
    const inRange =
      !isNaN(num) &&
      num >= (param.min ?? -Infinity) &&
      num <= (param.max ?? Infinity);
    if (inRange) {
      onChange(num);
    }
  };

  return (
    <div className="w-40">
      <NumberInput
        size="sm"
        aria-label={param.label}
        value={text}
        onValueChange={handleValueChange}
        onBlur={() => {
          if (String(text).trim() === '') {
            setText(value);
          }
        }}
        min={param.min}
        max={param.max}
        step={param.step ?? 1}
        unit={param.unit}
      />
    </div>
  );
};

/**
 * Single result display row
 */
const ResultRow: FC<{ result: SimulationResult }> = ({ result }) => {
  const isPositive = result.change > 0;
  const isNegative = result.change < 0;

  return (
    <div className="grid grid-cols-12 gap-x-5 items-center py-2.5">
      {/* Column 1: Label */}
      <div className="col-span-4">
        <span>{result.label}</span>
        {result.unit && (
          <span className="text-quaternary ms-1">({result.unit})</span>
        )}
      </div>

      {/* Column 2: Values */}
      <div className="col-span-5 flex items-center gap-1.5 text-quaternary">
        <span>{result.originalValue.toLocaleString()}</span>
        <span>&rarr;</span>
        <span className="text-primary">
          {result.simulatedValue.toLocaleString()}
        </span>
      </div>

      {/* Column 3: Change */}
      <div className="col-span-3 text-end">
        {(isPositive || isNegative) && (
          <span
            className={classNames(
              'badge',
              result.severity === 'success' && 'bg-success',
              result.severity === 'warning' && 'bg-warning',
              result.severity === 'danger' && 'bg-danger',
              result.severity === 'neutral' && 'bg-neutral-subtle text-neutral',
            )}
          >
            {isPositive && <TrendUpIcon weight="bold" className="me-1" />}
            {isNegative && <TrendDownIcon weight="bold" className="me-1" />}
            {formatSimulationChange(result)}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * What-If Simulator component for scenario analysis.
 * Allows users to adjust parameters and see the projected impact.
 */
export const WhatIfSimulator: FC<WhatIfSimulatorProps> = ({
  params,
  calculate,
  data,
}) => {
  const { paramValues, setParam, resetParams, results, hasChanges } =
    useSimulation({ params, calculate, data });

  return (
    <div>
      {/* Data source indicator */}
      <div className="flex justify-between items-center mb-3">
        <h6 className="mb-0">
          {translate('Scenario parameters')}
          {hasChanges && (
            <Tooltip label={translate('Reset to defaults')}>
              <ArrowCounterClockwiseIcon
                size={16}
                weight="bold"
                onClick={resetParams}
                className="ms-1.5"
              />
            </Tooltip>
          )}
        </h6>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          {/* Parameter inputs */}
          {params.map((param) => (
            <FormField key={param.id} className="mb-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <FormLabel className="mb-0">{param.label}</FormLabel>
                {param.description && <HelpIcon label={param.description} />}
              </div>
              <ParamInput
                param={param}
                value={paramValues[param.id]}
                onChange={(value) => setParam(param.id, value)}
              />
            </FormField>
          ))}
        </div>
        <div>
          {/* Results */}
          {results.length > 0 && (
            <>
              <h6 className="mb-2.5">{translate('Projected impact')}</h6>
              {results.map((result) => (
                <ResultRow key={result.id} result={result} />
              ))}
            </>
          )}

          {results.length === 0 && hasChanges && (
            <NoResult
              title={translate('No data available')}
              message={translate('Adjust parameters to see projected impact.')}
              noAction
            />
          )}
        </div>
      </div>
    </div>
  );
};
