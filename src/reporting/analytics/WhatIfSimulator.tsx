import {
  ArrowCounterClockwiseIcon,
  CaretDownIcon,
  CaretUpIcon,
  TrendDownIcon,
  TrendUpIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useCallback } from 'react';

import {
  BaseButton,
  FormField,
  FormLabel,
  HelpIcon,
  NativeSelect,
  RangeInput,
  Tooltip,
} from 'waldur-ui';

import { BaseInputField } from '@/form/InputField';
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
        <span className="whitespace-nowrap" style={{ minWidth: '60px' }}>
          {numValue}
          {param.unit && (
            <span className="text-quaternary ms-1">{param.unit}</span>
          )}
        </span>
      </div>
    );
  }

  // Default: number input with increment/decrement
  const isAtMin = param.min !== undefined && numValue <= param.min;
  const isAtMax = param.max !== undefined && numValue >= param.max;

  return (
    <div className="flex items-center gap-1">
      <BaseButton
        size="sm"
        variant="tertiary"
        onClick={() => handleChange(numValue - step)}
        disabled={isAtMin}
        tooltip={
          isAtMin
            ? translate('Minimum value reached')
            : translate('Decrease value')
        }
        iconNode={<CaretDownIcon weight="bold" />}
      />
      <BaseInputField
        type="number"
        size="sm"
        value={numValue}
        min={param.min}
        max={param.max}
        step={step}
        onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
        className="text-center"
        containerClassName="max-w-[100px]"
      />
      <BaseButton
        size="sm"
        variant="tertiary"
        onClick={() => handleChange(numValue + step)}
        disabled={isAtMax}
        tooltip={
          isAtMax
            ? translate('Maximum value reached')
            : translate('Increase value')
        }
        iconNode={<CaretUpIcon weight="bold" />}
      />
      {param.unit && <span className="text-quaternary">{param.unit}</span>}
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
