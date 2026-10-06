import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DASH_ESCAPE_CODE } from '@/table/constants';
import { renderWithProviders } from '@/test/harness';

import { ProposalDetailsOverviewStep } from './ProposalDetailsOverviewStep';

const baseProposal = {
  call_name: 'Battery Materials Call',
  created_by_name: 'Jane Roe',
} as any;

const renderStep = (proposal: any) =>
  renderWithProviders(
    <ProposalDetailsOverviewStep
      {...({ id: 'overview', params: { proposal } } as any)}
    />,
  );

describe('ProposalDetailsOverviewStep', () => {
  it('renders round deadline and reference for a round-bound proposal', () => {
    renderStep({
      ...baseProposal,
      round: { name: 'Round 1', cutoff_time: '2026-01-01T00:00:00Z' },
    });

    expect(screen.getByText('Details overview')).toBeInTheDocument();
    expect(screen.getByText('Battery Materials Call')).toBeInTheDocument();
    expect(screen.getByText('Round 1')).toBeInTheDocument();
  });

  // Regression: a proposal whose round is null (pre-engine / removed round) must
  // not crash the reviewer's review page (F4.3) — round.* is optional-chained.
  it('renders without crashing when round is null', () => {
    renderStep({ ...baseProposal, round: null });

    expect(screen.getByText('Details overview')).toBeInTheDocument();
    expect(screen.getByText('Battery Materials Call')).toBeInTheDocument();
    // No round name is shown, and the reference falls back to a dash rather
    // than throwing.
    expect(screen.queryByText('Round 1')).not.toBeInTheDocument();
    expect(screen.getAllByText(DASH_ESCAPE_CODE).length).toBeGreaterThan(0);
  });

  // Evaluators may receive the proposal without the applicant's name when the
  // call conceals it. Field already renders nothing for an empty value, so
  // what is at stake is its grid column: left in, it would hold a blank cell.
  it('leaves no empty column when the applicant name is concealed', () => {
    const { container } = renderStep({
      call_name: 'Battery Materials Call',
      round: null,
    });

    expect(screen.getByText('Battery Materials Call')).toBeInTheDocument();
    expect(screen.queryByText(/Created by/)).not.toBeInTheDocument();
    // The grid columns carry no role to query them by.
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const columns = Array.from(container.querySelectorAll('.row > .col-sm-6'));
    expect(columns.length).toBeGreaterThan(0);
    columns.forEach((column) => expect(column).not.toBeEmptyDOMElement());
  });

  it('shows the creator to viewers who may see it', () => {
    renderStep({ ...baseProposal, round: null });

    expect(screen.getByText('Jane Roe')).toBeInTheDocument();
  });
});
