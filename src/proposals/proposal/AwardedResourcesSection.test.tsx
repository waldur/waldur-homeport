import { screen, waitFor } from '@testing-library/react';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsAwardedResourcesList,
  proposalProposalsResourcesList,
} from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { renderWithProviders } from '@/test/harness';

import { AwardedResourcesSection } from './AwardedResourcesSection';

const renderSection = (ui: ReactElement) =>
  renderWithProviders(
    <DrawerProvider>
      <Provider store={configureStore()({ tables: {} })}>{ui}</Provider>
    </DrawerProvider>,
  );

const proposal = {
  uuid: 'proposal-1',
  call_uuid: 'call-1',
  call_name: 'Spring call',
} as any;

const hpc = {
  uuid: 'call-offering-hpc',
  offering_name: 'HPC Standard Allocation',
  components: [
    {
      type: 'cpu_hours',
      name: 'CPU hours',
      measured_unit: 'h',
      billing_type: 'limit',
    },
  ],
  plan_details: null,
};
const gpu = {
  uuid: 'call-offering-gpu',
  offering_name: 'GPU Burst Capacity',
  components: [
    {
      type: 'gpu_hours',
      name: 'GPU hours',
      measured_unit: 'h',
      billing_type: 'limit',
    },
  ],
  plan_details: null,
};

// No `response` on these: getAllPages stops after a result without one.
const page = (data: any[]) => Promise.resolve({ data }) as any;

const forbidden = () =>
  Promise.reject({
    detail:
      'The awarded resources are not visible until the decision is released.',
    response: { status: 403 },
  }) as any;

const requests = [
  {
    uuid: 'req-1',
    requested_offering: hpc,
    limits: { cpu_hours: 1000 },
    attributes: {},
  },
  {
    uuid: 'req-2',
    requested_offering: gpu,
    limits: { gpu_hours: 20 },
    attributes: {},
  },
];

const awards = [
  {
    uuid: 'award-1',
    requested_resource: 'req-1',
    requested_offering: hpc,
    plan: null,
    plan_name: 'Standard',
    limits: { cpu_hours: 600 },
    attributes: {},
    description: 'Scaled to the remaining capacity',
  },
];

describe('AwardedResourcesSection', () => {
  beforeEach(() => {
    vi.mocked(proposalProposalsResourcesList).mockImplementation(() =>
      page(requests),
    );
  });

  it('offers the editor to a manager while the decision is active', async () => {
    vi.mocked(proposalProposalsAwardedResourcesList).mockImplementation(() =>
      page(awards),
    );

    renderSection(<AwardedResourcesSection proposal={proposal} editable />);

    expect(await screen.findByText('Awarded resources')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Add item/ }),
    ).toBeInTheDocument();
  });

  // Completing the decision flips `editable` on the mounted section. The
  // table keeps its rows across renders and does not redraw them for a new
  // rowActions alone, so the menu must not outlive the decision.
  it('drops the row actions as soon as the section stops being editable', async () => {
    vi.mocked(proposalProposalsAwardedResourcesList).mockImplementation(() =>
      page(awards),
    );
    const store = configureStore()({ tables: {} });
    const ui = (editable: boolean) => (
      <DrawerProvider>
        <Provider store={store}>
          <AwardedResourcesSection proposal={proposal} editable={editable} />
        </Provider>
      </DrawerProvider>
    );

    const { rerender } = renderWithProviders(ui(true));
    await screen.findByText('Scaled to the remaining capacity');
    expect(await screen.findAllByTestId('actions-toggle')).not.toHaveLength(0);

    rerender(ui(false));

    await screen.findByText('Scaled to the remaining capacity');
    expect(screen.queryAllByTestId('actions-toggle')).toHaveLength(0);
    expect(
      screen.queryByRole('columnheader', { name: 'Actions' }),
    ).not.toBeInTheDocument();
  });

  it('is read-only otherwise', async () => {
    vi.mocked(proposalProposalsAwardedResourcesList).mockImplementation(() =>
      page(awards),
    );

    renderSection(
      <AwardedResourcesSection proposal={proposal} editable={false} />,
    );

    expect(
      await screen.findByText('Scaled to the remaining capacity'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Add item/ }),
    ).not.toBeInTheDocument();
    // Summarised in the header for a reader who has not opened it.
    expect(screen.getByText('Differs from the request')).toBeInTheDocument();
  });

  // The applicant before release, and reviewers always, are refused. That is
  // "not shown", not an error: the 403 must not reach the global handler,
  // which sends the whole page to the no-permission screen.
  it('renders nothing when the viewer may not read the award', async () => {
    vi.mocked(proposalProposalsAwardedResourcesList).mockImplementation(
      forbidden,
    );

    const { container, queryClient } = renderSection(
      <AwardedResourcesSection proposal={proposal} editable={false} />,
    );

    await waitFor(() => {
      const state = queryClient.getQueryState([
        'proposal-awarded-resources',
        proposal.uuid,
      ]);
      expect(state?.status).toBe('success');
      expect(state?.data).toBeNull();
    });
    expect(container).toBeEmptyDOMElement();
  });

  // While the decision is held for the round's publication the applicant is
  // refused even where the call shows awards to applicants; that refusal is
  // "not shown" too.
  it('renders nothing for the applicant while the decision is held', async () => {
    vi.mocked(proposalProposalsAwardedResourcesList).mockImplementation(() =>
      Promise.reject({
        detail:
          'The awarded resources are not visible while the decision is held.',
        response: { status: 403 },
        status: 403,
      }),
    );

    const { container, queryClient } = renderSection(
      <AwardedResourcesSection proposal={proposal} editable={false} />,
    );

    await waitFor(() =>
      expect(
        queryClient.getQueryState(['proposal-awarded-resources', proposal.uuid])
          ?.data,
      ).toBeNull(),
    );
    expect(container).toBeEmptyDOMElement();
  });

  // An applicant is refused the award until it is released. A card shown
  // while that answer is on its way would tell them a decision is under way.
  it('renders nothing while the award is loading', async () => {
    vi.mocked(proposalProposalsAwardedResourcesList).mockImplementation(
      () => new Promise(() => undefined) as any,
    );

    const { container } = renderSection(
      <AwardedResourcesSection
        proposal={proposal}
        editable={false}
        decisionOpen
      />,
    );

    await waitFor(() =>
      expect(proposalProposalsAwardedResourcesList).toHaveBeenCalled(),
    );
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText(/Being decided/)).not.toBeInTheDocument();
  });

  it('tells the call team a held award is closed to edits', async () => {
    vi.mocked(proposalProposalsAwardedResourcesList).mockImplementation(() =>
      page(awards),
    );

    renderSection(
      <AwardedResourcesSection
        proposal={proposal}
        editable={false}
        decisionHeld
      />,
    );

    expect(
      await screen.findByText(/held until the round publishes its results/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Add item/ }),
    ).not.toBeInTheDocument();
  });

  it('sets the awarded amounts against the requested ones', async () => {
    vi.mocked(proposalProposalsAwardedResourcesList).mockImplementation(() =>
      page(awards),
    );

    renderSection(
      <AwardedResourcesSection proposal={proposal} editable={false} />,
    );

    // The changed amount, with what was asked for beside it.
    expect(await screen.findByText('600 h')).toBeInTheDocument();
    expect(screen.getByText('requested 1000 h')).toBeInTheDocument();
    expect(screen.getByText('Changed')).toBeInTheDocument();
    // A request the award dropped stays visible as not awarded.
    expect(screen.getByText('GPU Burst Capacity')).toBeInTheDocument();
    expect(screen.getByText('Not awarded')).toBeInTheDocument();
  });
});
