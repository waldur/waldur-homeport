import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, FormSpy } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';
import { proposalPublicCallsRetrieve } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ResourceRequestWizardFormFirstPage } from './ResourceRequestWizardFormFirstPage';

const premium = {
  uuid: 'call-offering-premium',
  offering_name: 'HPC Premium Allocation',
  plan: 'https://example.org/api/marketplace-plans/plan-premium/',
};
const slurm = {
  uuid: 'call-offering-slurm',
  offering_name: 'SLURM HPC Allocation',
  plan: 'https://example.org/api/marketplace-plans/plan-slurm/',
};

describe('ResourceRequestWizardFormFirstPage', () => {
  // Moving an item to another offering carried the old offering's amounts
  // along, and the backend refused the save for naming components the new
  // offering does not have.
  it('drops the amounts and options when another offering is chosen', async () => {
    vi.mocked(proposalPublicCallsRetrieve).mockResolvedValue({
      data: { offerings: [premium, slurm] },
    } as any);
    let values: any;

    renderWithProviders(
      <Form
        onSubmit={vi.fn()}
        initialValues={{
          offering: premium,
          plan: premium.plan,
          limits: { cpu_hours: 15000, gpu_hours: 3000 },
          attributes: { prepaid_duration_months: 6 },
        }}
      >
        {() => (
          <>
            <ResourceRequestWizardFormFirstPage
              title="Edit"
              step={0}
              steps={[{ key: 'offering', label: 'Choose', completed: false }]}
              onPrev={vi.fn()}
              onStep={vi.fn()}
              data={{ call: { uuid: 'call-1' } }}
            />
            <FormSpy subscription={{ values: true }}>
              {(state) => {
                values = state.values;
                return null;
              }}
            </FormSpy>
          </>
        )}
      </Form>,
    );

    const user = userEvent.setup();
    // Named, so assistive technology can tell what the picker is for.
    await user.click(await screen.findByRole('combobox', { name: 'Offering' }));
    await user.click(await screen.findByText('SLURM HPC Allocation'));

    await waitFor(() => expect(values.offering.uuid).toBe(slurm.uuid));
    expect(values.plan).toBe(slurm.plan);
    expect(values.limits).toEqual({});
    expect(values.attributes).toEqual({});
  });
});
