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

const render = (offering, initialValues = {}, plan = undefined) =>
  renderWithProviders(
    <Form onSubmit={() => undefined} initialValues={initialValues}>
      {({ values }) => (
        <>
          <PlanForm offering={offering} plan={plan} />
          <output data-testid="unit">
            {values.unit?.value ?? values.unit}
          </output>
        </>
      )}
    </Form>,
  );

// A usage plan whose siblings agree on a month, while this one bills per day:
// a plan without resources is pinned to the month.
const pinnableOffering = {
  components: builtins,
  billing_period_applies: { inherit: true, limit: true, usage: false },
  plans: [{ unit: 'month' }],
};
const pinnableValues = { billing_mode: option('usage'), unit: option('day') };

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

describe('PlanForm billing period of a plan in use', () => {
  it('pins a plan without resources to the period of its siblings', async () => {
    render(pinnableOffering, pinnableValues, { resources_count: 0 });
    expect(await screen.findByTestId('unit')).toHaveTextContent('month');
  });

  it('keeps the period of a plan resources use', async () => {
    // The backend refuses a new unit for it, so moving it to the siblings'
    // period would make every save of the dialog fail.
    render(pinnableOffering, pinnableValues, { resources_count: 2 });
    expect(await screen.findByTestId('unit')).toHaveTextContent('day');
  });

  it('disables the period of a plan resources use and says why', async () => {
    // Without builtin components the period is the form's only select.
    render(
      { components: [], plans: [{ unit: 'month' }] },
      { unit: option('month') },
      { resources_count: 1 },
    );
    expect(
      await screen.findByText(
        'Cannot be changed while resources use this plan.',
      ),
    ).toBeInTheDocument();
    // react-select takes a disabled input out of the accessibility tree.
    expect(screen.getByRole('combobox', { hidden: true })).toBeDisabled();
  });

  it('leaves the period of a plan without resources editable', async () => {
    render(
      { components: [], plans: [{ unit: 'month' }] },
      { unit: option('month') },
      { resources_count: 0 },
    );
    expect(
      await screen.findByText(/Fixed and limit-based charges are billed/),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeEnabled();
  });
});
