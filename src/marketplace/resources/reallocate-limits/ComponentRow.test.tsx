import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { ComponentRow } from './ComponentRow';

// The cell clamps to the current limit while the user types, so it parses the
// input itself rather than letting the Field's parse do it. It used to do that
// with parseInt, which truncated every fraction here regardless of the
// precision the component declared -- and did so silently, since the value it
// handed back was a perfectly valid integer.
const renderRow = (limitDecimalPlaces: number | null, onSubmit = vi.fn()) => {
  const component = {
    type: 'storage',
    name: 'Storage',
    measured_unit: 'TB',
    is_boolean: false,
    limit: 100,
    usage: 0,
    changedLimit: 0,
    limit_decimal_places: limitDecimalPlaces,
  };
  render(
    <Form onSubmit={onSubmit} initialValues={{ limits: { storage: 10 } }}>
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <table>
            <tbody>
              <ComponentRow
                component={component}
                limits={{ min: 0, max: 100 } as any}
                offeringLimits={{} as any}
                plan={{ prices: { storage: 2 } } as any}
              />
            </tbody>
          </table>
        </form>
      )}
    </Form>,
  );
  return screen.getByTestId('row-storage-input') as HTMLInputElement;
};

describe('reallocate ComponentRow', () => {
  it('keeps a fraction on a component that declares precision', async () => {
    const input = renderRow(2);
    await userEvent.clear(input);
    await userEvent.type(input, '1.25');
    expect(input.value).toBe('1.25');
  });

  it('lets a zero straight after the separator be typed through', async () => {
    const input = renderRow(2);
    await userEvent.clear(input);
    await userEvent.type(input, '1.05');
    expect(input.value).toBe('1.05');
  });

  it('stays whole-number only when the component declares no precision', async () => {
    const input = renderRow(0);
    await userEvent.clear(input);
    await userEvent.type(input, '1.25');
    // Which digits survive the rejected separator is the browser's business;
    // what matters is that no fraction reaches a component that cannot hold one.
    expect(input.value).not.toContain('.');
    expect(Number.isInteger(Number(input.value))).toBe(true);
  });

  it('carries the declared precision into the step', () => {
    expect(renderRow(2).step).toBe('0.01');
  });

  it('steps by 1 when the component is whole-number only', () => {
    expect(renderRow(0).step).toBe('1');
  });

  it('still clamps to the current limit', async () => {
    const input = renderRow(2);
    await userEvent.clear(input);
    await userEvent.type(input, '999');
    expect(input.value).toBe('100');
  });
});
