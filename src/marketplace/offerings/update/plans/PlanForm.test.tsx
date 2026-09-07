import { screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { PlanForm } from './PlanForm';

const builtins = [
  { is_builtin: true, is_prepaid: false },
  { is_builtin: true, is_prepaid: false },
];

// AddPlanDialog seeds the form with whole select options, not bare values, so
// the fixtures have to do the same or they exercise a shape the app never sends.
const option = (value: string) => ({ value, label: value });

const render = (offering, initialValues = {}) =>
  renderWithProviders(
    <Form onSubmit={() => undefined} initialValues={initialValues}>
      {() => <PlanForm offering={offering} />}
    </Form>,
  );

describe('PlanForm billing period', () => {
  it('explains what the period bills when it applies', async () => {
    render(
      {
        components: builtins,
        billing_period_applies: { inherit: true, limit: true, usage: false },
        plans: [{ unit: 'month' }],
      },
      { billing_mode: option('limit'), unit: option('month') },
    );
    expect(
      await screen.findByText(/Fixed and limit-based charges are billed/),
    ).toBeInTheDocument();
  });

  it('pins the period and says it is inert under a usage plan', async () => {
    render(
      {
        components: builtins,
        billing_period_applies: { inherit: true, limit: true, usage: false },
        plans: [{ unit: 'month' }],
      },
      { billing_mode: option('usage'), unit: option('month') },
    );
    // Sibling plans agree on a period, so it is pinned rather than merely inert.
    expect(
      await screen.findByText(/Nothing on this plan is billed per period/),
    ).toBeInTheDocument();
    expect(screen.getByText(/follows the other plans/)).toBeInTheDocument();
  });

  it('says a mismatched period is allowed but blocks switching', async () => {
    render(
      {
        components: builtins,
        billing_period_applies: { inherit: true, limit: true, usage: false },
        plans: [{ unit: 'month' }],
      },
      { billing_mode: option('limit'), unit: option('day') },
    );
    expect(
      await screen.findByText(/The plan can be created/),
    ).toBeInTheDocument();
  });

  it('falls back to the old behaviour when the backend omits the field', async () => {
    render(
      { components: builtins, plans: [{ unit: 'month' }] },
      { billing_mode: option('usage'), unit: option('month') },
    );
    expect(
      await screen.findByText(/Fixed and limit-based charges are billed/),
    ).toBeInTheDocument();
  });
});
