import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { QuotasTable } from './QuotasTable';

const component = {
  type: 'cpu',
  name: 'CPU',
  billing_type: 'fixed',
  measured_unit: 'cores',
  is_prepaid: false,
} as any;

const renderTable = (plan: any, quotas: Record<string, number> = {}) =>
  renderWithProviders(
    <Form initialValues={{ quotas }} onSubmit={() => undefined}>
      {() => <QuotasTable components={[component]} plan={plan} />}
    </Form>,
  );

const row = () => screen.getAllByRole('row')[1];

describe('QuotasTable', () => {
  it('agrees between the amount input and the charge when a quota is set', () => {
    renderTable({ prices: { cpu: 50 }, unit: 'month' }, { cpu: 4 });
    expect(within(row()).getByRole('spinbutton')).toHaveValue(4);
    expect(within(row()).getByText(/4 × 50 = €200\.00 per month/)).toBeTruthy();
  });

  // A component added to the offering after the plan was created has no entry
  // in plan.quotas, so the input formats undefined to 0. The charge line has to
  // read that the same way, or the row says "Amount 0 ... Charge —".
  it('states the charge for a component the plan has no quota for', () => {
    renderTable({ prices: { cpu: 50 }, unit: 'month' }, {});
    expect(within(row()).getByRole('spinbutton')).toHaveValue(0);
    expect(within(row()).getByText(/0 × 50 = €0\.00 per month/)).toBeTruthy();
  });

  // The non-negative check ran, but the field never got `meta`, so a negative
  // amount was neither marked nor corrected. Typed key by key, parseIntField
  // turns a lone "-" into 0; pasted, -3 arrives whole.
  it('marks a pasted negative amount and brings it back to 0 when left', async () => {
    renderTable({ prices: { cpu: 50 }, unit: 'month' }, { cpu: 4 });
    const field = within(row()).getByRole('spinbutton');
    // Select the 4 and paste over it.
    await userEvent.tripleClick(field);
    await userEvent.paste('-3');
    expect(field).toHaveValue(-3);
    expect(field).toHaveAttribute('aria-invalid', 'true');

    await userEvent.tab();
    expect(field).toHaveValue(0);
    expect(field).not.toHaveAttribute('aria-invalid');
  });

  it('says why a negative amount is rejected', async () => {
    renderTable({ prices: { cpu: 50 }, unit: 'month' }, { cpu: 4 });
    const field = within(row()).getByRole('spinbutton');
    await userEvent.tripleClick(field);
    await userEvent.paste('-3');

    expect(
      within(row()).getByText('Value should not be negative.'),
    ).toBeInTheDocument();

    // Corrected when the field is left, so the message goes with it.
    await userEvent.tab();
    expect(
      within(row()).queryByText('Value should not be negative.'),
    ).not.toBeInTheDocument();
  });
});
