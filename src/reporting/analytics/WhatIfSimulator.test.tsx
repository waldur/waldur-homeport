import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SimulationParam } from './types';
import { WhatIfSimulator } from './WhatIfSimulator';

// The warning threshold of the quotas page: 50-100 %, in steps of 5.
const THRESHOLD: SimulationParam = {
  id: 'threshold',
  label: 'Warning threshold',
  type: 'number',
  defaultValue: 80,
  min: 50,
  max: 100,
  step: 5,
  unit: '%',
};

const renderSimulator = () => {
  const calculate = vi.fn().mockReturnValue([]);
  render(
    <WhatIfSimulator params={[THRESHOLD]} calculate={calculate} data={[]} />,
  );
  const lastThreshold = () =>
    calculate.mock.calls[calculate.mock.calls.length - 1][0].threshold;
  return { field: screen.getByLabelText('Warning threshold'), lastThreshold };
};

describe('WhatIfSimulator number parameter', () => {
  it('can be typed digit by digit when its minimum is above the first digit', async () => {
    const { field, lastThreshold } = renderSimulator();
    await userEvent.clear(field);
    await userEvent.type(field, '75');

    // "7" alone is below 50: it must neither snap to 50 nor reach the
    // simulation, so the field ends up with 75.
    expect(field).toHaveValue(75);
    expect(lastThreshold()).toBe(75);
  });

  it('clamps an out-of-range entry when the field is left', async () => {
    const { field, lastThreshold } = renderSimulator();
    await userEvent.clear(field);
    await userEvent.type(field, '30');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    // The simulation keeps the last valid value meanwhile.
    expect(lastThreshold()).toBe(80);

    await userEvent.tab();
    expect(field).toHaveValue(50);
    expect(lastThreshold()).toBe(50);
  });

  it('puts an emptied field back to the current value', async () => {
    const { field, lastThreshold } = renderSimulator();
    await userEvent.clear(field);
    await userEvent.tab();
    expect(field).toHaveValue(80);
    expect(lastThreshold()).toBe(80);
  });

  it('shows the unit', () => {
    renderSimulator();
    expect(screen.getByText('%')).toBeInTheDocument();
  });
});
