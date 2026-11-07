import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, FormSpy } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalPublicCallsRetrieve } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import {
  countRequestsByOffering,
  ResourceRequestWizardFormFirstPage,
} from './ResourceRequestWizardFormFirstPage';

// Every request of the proposal, as the shared query returns them.
const resourceRows = vi.hoisted(() => ({ current: undefined as any }));
vi.mock('@/proposals/useProposalResourceRows', () => ({
  // Disabled without a proposal, as the real hook is.
  useProposalResourceRows: (uuid?: string) => ({
    data: uuid ? resourceRows.current : undefined,
  }),
}));

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
const request = (uuid: string, offering: { uuid: string }) => ({
  uuid,
  requested_offering: { uuid: offering.uuid },
});

const renderPage = ({
  initialValues = {},
  data = { call: { uuid: 'call-1' } },
}: { initialValues?: any; data?: any } = {}) => {
  let values: any;
  renderWithProviders(
    <Form onSubmit={vi.fn()} initialValues={initialValues}>
      {() => (
        <>
          <ResourceRequestWizardFormFirstPage
            title="Edit"
            step={0}
            steps={[{ key: 'offering', label: 'Choose', completed: false }]}
            onPrev={vi.fn()}
            onStep={vi.fn()}
            data={data}
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
  return () => values;
};

const NOTICE = /Already requested in this proposal/;

describe('countRequestsByOffering', () => {
  it('counts the requests per call offering, leaving out the one edited', () => {
    const counts = countRequestsByOffering(
      [request('r1', premium), request('r2', premium), request('r3', slurm)],
      'r3',
    );
    expect(counts.get(premium.uuid)).toBe(2);
    expect(counts.get(slurm.uuid)).toBeUndefined();
    expect(countRequestsByOffering(undefined).size).toBe(0);
  });
});

describe('ResourceRequestWizardFormFirstPage', () => {
  beforeEach(() => {
    resourceRows.current = undefined;
    vi.mocked(proposalPublicCallsRetrieve).mockResolvedValue({
      data: { offerings: [premium, slurm] },
    } as any);
  });

  // Moving an item to another offering carried the old offering's amounts
  // along, and the backend refused the save for naming components the new
  // offering does not have.
  it('drops the amounts and options when another offering is chosen', async () => {
    const values = renderPage({
      initialValues: {
        offering: premium,
        plan: premium.plan,
        limits: { cpu_hours: 15000, gpu_hours: 3000 },
        attributes: { prepaid_duration_months: 6 },
      },
    });

    const user = userEvent.setup();
    // Named, so assistive technology can tell what the picker is for.
    await user.click(await screen.findByRole('combobox', { name: 'Offering' }));
    await user.click(await screen.findByText('SLURM HPC Allocation'));

    await waitFor(() => expect(values().offering.uuid).toBe(slurm.uuid));
    expect(values().plan).toBe(slurm.plan);
    expect(values().limits).toEqual({});
    expect(values().attributes).toEqual({});
  });

  it('warns when the proposal already requests the chosen offering', async () => {
    resourceRows.current = [request('r1', premium), request('r2', premium)];
    renderPage({
      initialValues: { offering: premium },
      data: { call: { uuid: 'call-1' }, proposalUuid: 'p1' },
    });

    expect(
      await screen.findByText(
        'You already requested HPC Premium Allocation in this proposal 2 times. Add it again only if you need a separate request.',
      ),
    ).toBeInTheDocument();
  });

  it('speaks in the singular for one earlier request', async () => {
    resourceRows.current = [request('r1', premium)];
    renderPage({
      initialValues: { offering: premium },
      data: { call: { uuid: 'call-1' }, proposalUuid: 'p1' },
    });

    expect(
      await screen.findByText(
        'You already requested HPC Premium Allocation in this proposal. Add it again only if you need a separate request.',
      ),
    ).toBeInTheDocument();
  });

  it('words the notice for an edit, where nothing is added', async () => {
    resourceRows.current = [request('r1', premium), request('r2', premium)];
    renderPage({
      initialValues: { offering: premium },
      data: {
        call: { uuid: 'call-1' },
        proposalUuid: 'p1',
        editingRequestUuid: 'r1',
      },
    });

    expect(
      await screen.findByText(
        'Another request in this proposal already asks for HPC Premium Allocation.',
      ),
    ).toBeInTheDocument();
  });

  it('does not count the request being edited against itself', async () => {
    resourceRows.current = [request('r1', premium)];
    renderPage({
      initialValues: { offering: premium },
      data: {
        call: { uuid: 'call-1' },
        proposalUuid: 'p1',
        editingRequestUuid: 'r1',
      },
    });

    await screen.findByRole('combobox', { name: 'Offering' });
    expect(screen.queryByText(NOTICE)).not.toBeInTheDocument();
  });

  it('shows the notice once a requested offering is picked', async () => {
    resourceRows.current = [request('r1', slurm)];
    renderPage({ data: { call: { uuid: 'call-1' }, proposalUuid: 'p1' } });

    const user = userEvent.setup();
    await user.click(await screen.findByRole('combobox', { name: 'Offering' }));
    await user.click(await screen.findByText('SLURM HPC Allocation'));

    expect(await screen.findByText(NOTICE)).toBeInTheDocument();
  });

  it('says nothing without a proposal, as awards and templates pass none', async () => {
    resourceRows.current = [request('r1', premium)];
    renderPage({ initialValues: { offering: premium } });

    await screen.findByRole('combobox', { name: 'Offering' });
    expect(screen.queryByText(NOTICE)).not.toBeInTheDocument();
  });

  it('keeps quiet when the picker is not shown', async () => {
    vi.mocked(proposalPublicCallsRetrieve).mockResolvedValue({
      data: { offerings: [] },
    } as any);
    resourceRows.current = [request('r1', premium)];
    renderPage({
      initialValues: { offering: premium },
      data: { call: { uuid: 'call-1' }, proposalUuid: 'p1' },
    });

    await screen.findByText('There are no offerings to request');
    expect(screen.queryByText(NOTICE)).not.toBeInTheDocument();
  });
});
