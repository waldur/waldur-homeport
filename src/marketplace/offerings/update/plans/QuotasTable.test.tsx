import { screen, within } from '@testing-library/react';
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
});
