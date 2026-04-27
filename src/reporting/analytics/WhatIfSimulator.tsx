import {
  ArrowCounterClockwiseIcon,
  CaretDownIcon,
  CaretUpIcon,
  QuestionIcon,
  TrendDownIcon,
  TrendUpIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useCallback } from 'react';
import { Col, Form, InputGroup, Row } from 'react-bootstrap';

import { Tip } from '@/core/Tooltip';
import { CompactSubmitButton } from '@/form/CompactSubmitButton';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { SimulationParam, SimulationResult } from './types';
import { formatSimulationChange, useSimulation } from './useSimulation';

import './range.css';

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
      <Form.Select
        className="w-50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {param.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Form.Select>
    );
  }

  if (param.type === 'slider') {
    const min = param.min ?? 0;
    const max = param.max ?? 100;
    const percentage = ((numValue - min) / (max - min)) * 100;

    return (
      <div className="d-flex align-items-center gap-3">
        <Form.Range
          value={numValue}
          min={min}
          max={max}
          step={step}
          onChange={(e) => handleChange(parseFloat(e.target.value))}
          className="flex-grow-1 custom-filled-range"
          // @ts-ignore
          style={{ '--range-progress': `${percentage}%` }}
        />
        <span className="text-nowrap fw-semibold" style={{ minWidth: '60px' }}>
          {numValue}
          {param.unit && <span className="text-muted ms-1">{param.unit}</span>}
        </span>
      </div>
    );
  }

  // Default: number input with increment/decrement
  const isAtMin = param.min !== undefined && numValue <= param.min;
  const isAtMax = param.max !== undefined && numValue >= param.max;

  return (
    <InputGroup size="sm">
      <Tip
        id={`${param.id}-dec`}
        label={
          isAtMin
            ? translate('Minimum value reached')
            : translate('Decrease value')
        }
      >
        <CompactSubmitButton
          submitting={false}
          type="button"
          variant="outline-secondary"
          onClick={() => handleChange(numValue - step)}
          disabled={isAtMin}
          iconNode={<CaretDownIcon weight="bold" />}
          label=""
        />
      </Tip>
      <Form.Control
        type="number"
        value={numValue}
        min={param.min}
        max={param.max}
        step={step}
        onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
        className="text-center"
        style={{ maxWidth: '100px' }}
      />
      <Tip
        id={`${param.id}-inc`}
        label={
          isAtMax
            ? translate('Maximum value reached')
            : translate('Increase value')
        }
      >
        <CompactSubmitButton
          submitting={false}
          type="button"
          variant="outline-secondary"
          onClick={() => handleChange(numValue + step)}
          disabled={isAtMax}
          iconNode={<CaretUpIcon weight="bold" />}
          label=""
        />
      </Tip>
      {param.unit && <InputGroup.Text>{param.unit}</InputGroup.Text>}
    </InputGroup>
  );
};

/**
 * Single result display row
 */
const ResultRow: FC<{ result: SimulationResult }> = ({ result }) => {
  const isPositive = result.change > 0;
  const isNegative = result.change < 0;

  return (
    <div className="row align-items-center py-3">
      {/* Column 1: Label */}
      <div className="col-4">
        <span className="fw-semibold">{result.label}</span>
        {result.unit && (
          <span className="text-muted ms-1">({result.unit})</span>
        )}
      </div>

      {/* Column 2: Values */}
      <div className="col-5 d-flex align-items-center gap-2 text-muted">
        <span>{result.originalValue.toLocaleString()}</span>
        <span>&rarr;</span>
        <span className="text-dark">
          {result.simulatedValue.toLocaleString()}
        </span>
      </div>

      {/* Column 3: Change */}
      <div className="col-3 text-end">
        {(isPositive || isNegative) && (
          <span
            className={classNames(
              'badge',
              result.severity === 'success' && 'bg-success',
              result.severity === 'warning' && 'bg-warning',
              result.severity === 'danger' && 'bg-danger',
              result.severity === 'neutral' && 'bg-secondary',
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
    <div className="what-if-simulator">
      {/* Data source indicator */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h6 className="mb-0">
          {translate('Scenario parameters')}
          {hasChanges && (
            <Tip label={translate('Reset to defaults')} id="reset-params">
              <ArrowCounterClockwiseIcon
                className="ms-2"
                size={16}
                weight="bold"
                onClick={resetParams}
              />
            </Tip>
          )}
        </h6>
      </div>

      <Row>
        <Col>
          {/* Parameter inputs */}
          {params.map((param) => (
            <div key={param.id} className="mb-3">
              <Form.Label className="d-flex align-items-center gap-2 mb-2">
                {param.label}
                {param.description && (
                  <Tip id={`${param.id}-help`} label={param.description}>
                    <QuestionIcon size={16} weight="bold" />
                  </Tip>
                )}
              </Form.Label>
              <ParamInput
                param={param}
                value={paramValues[param.id]}
                onChange={(value) => setParam(param.id, value)}
              />
            </div>
          ))}
        </Col>
        <Col>
          {/* Results */}
          {results.length > 0 && (
            <>
              <h6 className="mb-3">{translate('Projected impact')}</h6>
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
        </Col>
      </Row>
    </div>
  );
};
