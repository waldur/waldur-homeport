import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ComponentEditRow, ComponentEditRow2 } from './ComponentEditRow';

const component = {
  type: 'cpu_hours',
  name: 'CPU Core Hours',
  measured_unit: 'hours',
  min_value: 1000,
  max_value: 500000,
  prices: [],
} as any;

const renderRow = (row: ReactNode) =>
  renderWithProviders(
    <Form onSubmit={vi.fn()}>
      {() => (
        <table>
          <tbody>{row}</tbody>
        </table>
      )}
    </Form>,
  );

describe('ComponentEditRow2', () => {
  it('associates the row label with the amount input', () => {
    renderRow(<ComponentEditRow2 component={component} hidePrices />);
    expect(screen.getByLabelText('CPU Core Hours')).toHaveRole('spinbutton');
  });

  it('passes the field meta through so the limit error is shown', async () => {
    renderRow(<ComponentEditRow2 component={component} hidePrices />);
    const input = screen.getByLabelText('CPU Core Hours');
    await userEvent.type(input, '10');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      'hours Value should not be lesser than 1000.',
    );
  });
});

describe('ComponentEditRow', () => {
  it('marks an out-of-range amount invalid and describes it', async () => {
    renderRow(<ComponentEditRow component={component} hidePrices />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).not.toHaveAttribute('aria-describedby');

    await userEvent.type(input, '600000');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/500000|500,000/);
  });
});
