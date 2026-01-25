import {
  ArrowCounterClockwiseIcon,
  CaretDownIcon,
  CaretUpIcon,
  TrendDownIcon,
  TrendUpIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useCallback } from 'react';
import { Card, Form, InputGroup } from 'react-bootstrap';

import { CompactSubmitButton } from '@waldur/form/CompactSubmitButton';
import { translate } from '@waldur/i18n';

import { MockDataIndicator } from './MockDataIndicator';
import { DataSourceType, SimulationParam, SimulationResult } from './types';
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
  /** Data source indicator */
  dataSource?: DataSourceType;
  /** Description of data source */
  dataSourceDescription?: string;
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="sm"
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
          className="flex-grow-1"
        />
        <span className="text-nowrap fw-semibold" style={{ minWidth: '60px' }}>
          {numValue}
          {param.unit && <span className="text-muted ms-1">{param.unit}</span>}
        </span>
        <div className="progress" style={{ width: '60px', height: '6px' }}>
          <div
            className="progress-bar bg-primary"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  // Default: number input with increment/decrement
  return (
    <InputGroup size="sm">
      <CompactSubmitButton
        submitting={false}
        type="button"
        variant="outline-secondary"
        onClick={() => handleChange(numValue - step)}
        disabled={param.min !== undefined && numValue <= param.min}
        iconNode={<CaretDownIcon weight="bold" />}
        label=""
      />
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
      <CompactSubmitButton
        submitting={false}
        type="button"
        variant="outline-secondary"
        onClick={() => handleChange(numValue + step)}
        disabled={param.max !== undefined && numValue >= param.max}
        iconNode={<CaretUpIcon weight="bold" />}
        label=""
      />
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
    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
      <div>
        <span className="fw-semibold">{result.label}</span>
        {result.unit && (
          <span className="text-muted ms-1">({result.unit})</span>
        )}
      </div>
      <div className="d-flex align-items-center gap-3">
        <span className="text-muted">
          {result.originalValue.toLocaleString()}
        </span>
        <span className="text-muted">&rarr;</span>
        <span className="fw-bold">
          {result.simulatedValue.toLocaleString()}
        </span>
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
  dataSource = 'real',
  dataSourceDescription,
}) => {
  const { paramValues, setParam, resetParams, results, hasChanges } =
    useSimulation({ params, calculate, data });

  return (
    <div className="what-if-simulator">
      {/* Data source indicator */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h6 className="mb-0">{translate('Scenario parameters')}</h6>
        <MockDataIndicator
          source={dataSource}
          description={dataSourceDescription}
        />
      </div>

      {/* Parameter inputs */}
      <Card className="mb-4">
        <Card.Body>
          {params.map((param) => (
            <div key={param.id} className="mb-3">
              <Form.Label className="d-flex justify-content-between">
                <span>{param.label}</span>
                {param.description && (
                  <small className="text-muted">{param.description}</small>
                )}
              </Form.Label>
              <ParamInput
                param={param}
                value={paramValues[param.id]}
                onChange={(value) => setParam(param.id, value)}
              />
            </div>
          ))}

          {hasChanges && (
            <CompactSubmitButton
              submitting={false}
              type="button"
              variant="outline-secondary"
              onClick={resetParams}
              className="mt-2"
              iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
              iconOnLeft
              label={translate('Reset to defaults')}
            />
          )}
        </Card.Body>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <>
          <h6 className="mb-3">{translate('Projected impact')}</h6>
          <Card>
            <Card.Body>
              {results.map((result) => (
                <ResultRow key={result.id} result={result} />
              ))}
            </Card.Body>
          </Card>
        </>
      )}

      {results.length === 0 && hasChanges && (
        <div className="text-muted text-center py-4">
          {translate('Adjust parameters to see projected impact')}
        </div>
      )}
    </div>
  );
};
