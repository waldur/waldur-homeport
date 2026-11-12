import { screen, waitFor, within } from '@testing-library/react';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalRequestedOfferingsTeamRetrieve,
  proposalRequestedOfferingsTeamStepSlotsList,
  proposalRequestedOfferingsTeamStepsList,
} from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { renderWithProviders } from '@/test/harness';

import { OfferingTeamStepsRow } from './OfferingTeamStepsRow';

const render = (ui: ReactElement) =>
  renderWithProviders(
    <DrawerProvider>
      <Provider store={configureStore()({ tables: {} })}>{ui}</Provider>
    </DrawerProvider>,
  );

const row = {
  uuid: 'ro-1',
  state: 'accepted',
  call_uuid: 'call-1',
  call_name: 'Extreme Scale',
  offering_uuid: 'off-1',
  offering_name: 'Booster partition',
  offering_managers_count: 1,
  team_steps_count: 2,
  default_delegate_name: null,
} as any;

const step = (key: string, name: string, values = {}) => ({
  uuid: `step-${key}`,
  key,
  name,
  phase: 'evaluation',
  duration_in_days: 21,
  team_part: 'completes',
  per_requested_offering: true,
  delegable_within_team: true,
  notification_triggers: [],
  ...values,
});

const slot = (proposal: string, stepKey: string, stepName: string) => ({
  uuid: `slot-${proposal}`,
  proposal_uuid: proposal,
  proposal_name: `Proposal ${proposal}`,
  proposal_slug: '',
  step_key: stepKey,
  step_name: stepName,
  delegate_uuid: null,
  delegate_name: null,
  delegate_accepted: false,
  stand_in: false,
  due_at: null,
  overdue: false,
});

describe('OfferingTeamStepsRow', () => {
  beforeEach(() => {
    vi.mocked(proposalRequestedOfferingsTeamStepsList).mockResolvedValue({
      data: [
        step('technical_assessment', 'Technical assessment'),
        step('extension_assessment', 'Extension request assessment', {
          phase: 'extension',
          duration_in_days: 14,
        }),
      ],
    } as any);
    vi.mocked(proposalRequestedOfferingsTeamRetrieve).mockResolvedValue({
      data: { managers: [], delegates: [] },
    } as any);
  });

  it('lists the team’s steps one line each, and what is open on them in one table', async () => {
    vi.mocked(proposalRequestedOfferingsTeamStepSlotsList).mockResolvedValue({
      data: [
        slot('p1', 'technical_assessment', 'Technical assessment'),
        slot('p2', 'extension_assessment', 'Extension request assessment'),
      ],
    } as any);
    render(<OfferingTeamStepsRow row={row} providerUuid="prov" />);

    const steps = await screen.findByTestId('offering-team-steps');
    await waitFor(() =>
      expect(within(steps).getByText(/^Technical assessment/)).toBeVisible(),
    );
    expect(within(steps).getByText(/Evaluation · 21 days/)).toBeVisible();
    expect(
      within(steps).getByText(/^Extension request assessment/),
    ).toBeVisible();
    expect(
      within(steps).getByText(/Extension request · 14 days/),
    ).toBeVisible();
    expect(await screen.findByText('Proposal p1')).toBeInTheDocument();
    expect(screen.getByText('Proposal p2')).toBeInTheDocument();
    // Slots of two steps in one table: each names its step.
    expect(
      screen.getByRole('columnheader', { name: /Step/ }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('default-hand-on')).toHaveTextContent(
      'New slots stay with the offering’s managers.',
    );
    expect(screen.queryByText('People')).not.toBeInTheDocument();
    expect(screen.queryByText('Demand by round')).not.toBeInTheDocument();
    expect(screen.getByText('Demand for this call')).toBeInTheDocument();
  });

  it('says so when nothing is open', async () => {
    vi.mocked(proposalRequestedOfferingsTeamStepSlotsList).mockResolvedValue({
      data: [],
    } as any);
    render(<OfferingTeamStepsRow row={row} providerUuid="prov" />);
    await waitFor(() =>
      expect(
        screen.getByText(/Nothing is waiting on your team in this call/),
      ).toBeInTheDocument(),
    );
  });

  it('asks to accept a request before work arrives', async () => {
    render(
      <OfferingTeamStepsRow
        row={{ ...row, state: 'requested' }}
        providerUuid="prov"
      />,
    );
    expect(
      await screen.findByText(
        'Accept the request to receive work on the call’s proposals.',
      ),
    ).toBeInTheDocument();
    expect(
      proposalRequestedOfferingsTeamStepSlotsList,
    ).not.toHaveBeenCalledWith(
      expect.objectContaining({ path: { uuid: 'ro-2' } }),
    );
  });
});
