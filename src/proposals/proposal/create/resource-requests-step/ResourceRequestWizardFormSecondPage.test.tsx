import { waitFor } from '@testing-library/react';
import { Form, FormSpy } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';
import {
  marketplacePublicOfferingsRetrieve,
  proposalPublicCallsRetrieve,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ResourceRequestWizardFormSecondPage } from './ResourceRequestWizardFormSecondPage';

// Not what is under test, and they want a fully priced offering.
vi.mock('@/marketplace/details/plan/TabbedPlanComponents', () => ({
  TabbedPlanComponents: () => null,
}));
vi.mock('@/marketplace/details/plan/PlanDescriptionButton', () => ({
  PlanDescriptionButton: () => null,
}));

const plan = { uuid: 'plan-1', name: 'Standard' };
const callOffering = {
  uuid: 'call-offering-1',
  offering_uuid: 'offering-1',
  offering_name: 'HPC',
  plan_details: plan,
};
const retrieved = {
  uuid: 'offering-1',
  name: 'HPC',
  plans: [plan],
  components: [],
  options: {
    order: ['qos'],
    options: { qos: { type: 'select_string', label: 'QoS', required: true } },
  },
};

// Renders the page with the offering retrieve held until `resolveOffering`.
const renderPage = (initialValues: Record<string, unknown>) => {
  vi.mocked(proposalPublicCallsRetrieve).mockResolvedValue({
    data: {},
  } as any);
  let resolveOffering: (value: any) => void;
  vi.mocked(marketplacePublicOfferingsRetrieve).mockReturnValue(
    new Promise((resolve) => {
      resolveOffering = resolve;
    }) as any,
  );
  const state = { values: undefined as any };

  renderWithProviders(
    <Form onSubmit={vi.fn()} initialValues={initialValues}>
      {() => (
        <>
          {/* Before the page: a spy subscribes in an effect, and would
              miss the change the page makes in its own first effect. */}
          <FormSpy subscription={{ values: true }}>
            {(formState) => {
              state.values = formState.values;
              return null;
            }}
          </FormSpy>
          <ResourceRequestWizardFormSecondPage
            title="New resource"
            step={1}
            steps={[]}
            onPrev={vi.fn()}
            onStep={vi.fn()}
            data={{ call: { uuid: 'call-1' } }}
          />
        </>
      )}
    </Form>,
  );
  return { state, resolveOffering: (data) => resolveOffering({ data }) };
};

describe('ResourceRequestWizardFormSecondPage', () => {
  // waldur/waldur-homeport#129 on GitHub: on a first open the fallback built
  // from the call offering was stored while the offering loaded, and never
  // replaced — so the options step, and its required QoS, never appeared.
  it('replaces the fallback with the offering once it loads', async () => {
    const { state, resolveOffering } = renderPage({
      offering: callOffering,
      plan,
    });

    // The fallback goes in first: it has no options.
    await waitFor(() =>
      expect(state.values.mainOffering?.uuid).toBe('offering-1'),
    );
    expect(state.values.mainOffering.options).toBeUndefined();

    resolveOffering(retrieved);

    await waitFor(() =>
      expect(state.values.mainOffering.options?.order).toEqual(['qos']),
    );
    // The plan the applicant had is kept.
    expect(state.values.plan).toEqual(plan);
  });

  // An award may sit on another plan of the offering than the call's. Only
  // the retrieved offering lists it, so its URL resolves once that lands —
  // even though the fallback, built from a request that carries the
  // offering's options, came first.
  it('resolves a plan only the retrieved offering lists', async () => {
    const otherPlan = { uuid: 'plan-2', name: 'Large' };
    const { state, resolveOffering } = renderPage({
      offering: { ...callOffering, options: retrieved.options },
      plan: 'https://example.org/api/marketplace-plans/plan-2/',
    });
    await waitFor(() =>
      expect(state.values.mainOffering?.uuid).toBe('offering-1'),
    );
    // The fallback knows only the call's plan.
    expect(state.values.plan).toBe(
      'https://example.org/api/marketplace-plans/plan-2/',
    );

    resolveOffering({ ...retrieved, plans: [plan, otherPlan] });

    await waitFor(() => expect(state.values.plan).toEqual(otherPlan));
    expect(state.values.mainOffering.plans).toHaveLength(2);
  });

  // A refetch brings a new object for the same offering: storing it again
  // would rerun the plan rewrite for nothing.
  it('keeps an offering it already has with its options', async () => {
    const stored = { ...retrieved, marker: 'stored' };
    const { state, resolveOffering } = renderPage({
      offering: callOffering,
      plan,
      mainOffering: stored,
    });
    await waitFor(() => expect(state.values).toBeDefined());

    resolveOffering({ ...retrieved });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(state.values.mainOffering.marker).toBe('stored');
    expect(state.values.plan).toEqual(plan);
  });
});
