import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsResourcesList,
  proposalPublicCallsRetrieve,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ProposalDetailsDialog } from './ProposalDetailsDialog';

vi.mock('@/proposals/presentation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/proposals/presentation')>()),
  usesCallVocabulary: () => true,
  showsCallContext: () => true,
}));

// The tables, reduced to their rows' cells.
vi.mock('@/table/Table', () => ({
  default: ({ rows, columns, verboseName }) => (
    <div data-testid={`table-${verboseName}`}>
      {(rows ?? []).map((row, index) => (
        <div key={index} data-testid="row">
          {columns.map((column, i) => (
            <span key={i}>{column.render({ row })}</span>
          ))}
        </div>
      ))}
    </div>
  ),
}));
// Rows loaded once per filter; a fetcher rebuilt on every render (as the
// documents card's is) must not reload them.
vi.mock('@/table/useTable', async () => {
  const { useEffect, useRef, useState } = await import('react');
  return {
    useTable: ({ fetchData, filter }) => {
      const [rows, setRows] = useState([]);
      const fetchRef = useRef(fetchData);
      fetchRef.current = fetchData;
      useEffect(() => {
        fetchRef.current({}).then((result) => setRows(result.rows));
      }, [filter]);
      return { rows, fetch: () => undefined };
    },
  };
});

const call = {
  uuid: 'call-1',
  name: 'Extreme Scale Access',
  slug: 'extreme-scale',
  backend_id: 'ESA-2026',
  customer_name: 'National Research Council',
  state: 'active',
  start_date: '2026-09-01T00:00:00Z',
  end_date: '2026-12-31T00:00:00Z',
  fixed_duration_in_days: 365,
  max_prepaid_duration_months: 6,
  external_url: 'https://example.org/esa',
  description: 'Compute time for the **largest** problems.',
  evaluation_start: 'on_submission',
  publish_results: 'with_round',
  reviews_visible_to_submitters: true,
  reviewer_identity_visible_to_submitters: false,
  offerings: [
    {
      uuid: 'ro-hpc',
      offering_name: 'HPC partition',
      provider_name: 'Northern Centre',
      plan_details: { name: 'Standard' },
      components: [{ name: 'CPU hours' }, { name: 'Storage' }],
    },
    {
      uuid: 'ro-gpu',
      offering_name: 'GPU partition',
      provider_name: 'Southern Centre',
      plan_details: { name: 'Accelerated' },
      components: [{ name: 'GPU hours' }],
    },
  ],
  resource_templates: [
    { name: 'Small allocation', requested_offering_uuid: 'ro-hpc' },
  ],
  documents: [
    {
      file: 'https://example.org/guide.pdf',
      file_name: 'call_documents/guide.pdf',
      description: "Applicant's guide",
      created: '2026-09-01T00:00:00Z',
    },
  ],
};

const proposal = {
  uuid: 'proposal-1',
  call_uuid: 'call-1',
  round: {
    name: 'Autumn round',
    slug: 'NRC-ESA-202609',
    start_time: '2026-09-01T00:00:00Z',
    cutoff_time: '2026-10-31T00:00:00Z',
    allocation_date: '2027-01-15',
  },
} as any;

const workflowStates = [
  { step_name: 'Submission check', kind: 'assessment', order: 1 },
  { step_name: 'Response to reviews', kind: 'applicant_action', order: 5 },
  { step_name: 'Award response', kind: 'applicant_action', order: 9 },
] as any;

const renderDialog = (overrides = {}) => {
  vi.mocked(proposalPublicCallsRetrieve).mockResolvedValue({
    data: { ...call, ...overrides },
  } as any);
  return renderWithProviders(
    <ProposalDetailsDialog
      proposal={proposal}
      workflowStates={workflowStates}
    />,
  );
};

const openTab = async (name: string) =>
  userEvent.click(await screen.findByRole('tab', { name }));

describe('ProposalDetailsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalProposalsResourcesList).mockResolvedValue({
      data: [{ requested_offering: { uuid: 'ro-gpu' } }],
    } as any);
  });

  it('opens on the call, with its reference code', async () => {
    renderDialog();
    expect(await screen.findByText('National Research Council')).toBeVisible();
    // The public call carries the reference code as backend_id.
    expect(screen.getByText('ESA-2026')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText(/up to 6 months/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'https://example.org/esa' }),
    ).toBeInTheDocument();
    // The description is read in place, not behind a toggle.
    expect(screen.getByText('largest')).toBeVisible();
    expect(screen.queryByRole('button', { name: /^Description/ })).toBeNull();
  });

  it('lists the call offerings without marking the proposal requests', async () => {
    renderDialog();
    await openTab('Offerings');
    const rows = await screen.findAllByTestId('row');
    expect(rows).toHaveLength(2);
    const [hpc, gpu] = rows;
    expect(within(hpc).getByText('HPC partition')).toBeInTheDocument();
    expect(within(hpc).getByText('CPU hours, Storage')).toBeInTheDocument();
    expect(
      within(hpc).getByText('Templates: Small allocation'),
    ).toBeInTheDocument();
    expect(within(gpu).getByText('GPU partition')).toBeInTheDocument();
    expect(screen.queryByText('Requested')).not.toBeInTheDocument();
  });

  it('lists the call documents', async () => {
    renderDialog();
    await openTab('Documents');
    expect(
      await screen.findByRole('link', { name: 'guide.pdf' }),
    ).toHaveAttribute('href', 'https://example.org/guide.pdf');
  });

  it('describes the round', async () => {
    renderDialog();
    await openTab('Round');
    expect(await screen.findByText('Autumn round')).toBeInTheDocument();
    expect(screen.getByText('NRC-ESA-202609')).toBeInTheDocument();
    expect(
      screen.getByText('Published for the whole round at once'),
    ).toBeInTheDocument();
  });

  it('says evaluation starts on submission', async () => {
    renderDialog();
    await openTab('How it is evaluated');
    expect(
      await screen.findByText(
        'Evaluation starts as soon as a proposal is submitted.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'The applicant sees the reviews of their proposal; the reviewers stay anonymous.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'The applicant acts at these steps: Response to reviews, Award response.',
      ),
    ).toBeInTheDocument();
  });

  it('says evaluation starts at the cutoff', async () => {
    renderDialog({
      evaluation_start: 'at_cutoff',
      reviews_visible_to_submitters: false,
    });
    await openTab('How it is evaluated');
    expect(
      await screen.findByText(
        'Evaluation starts when the round closes at its cutoff, for all its proposals together.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('The applicant does not see the reviews.'),
    ).toBeInTheDocument();
  });
});
