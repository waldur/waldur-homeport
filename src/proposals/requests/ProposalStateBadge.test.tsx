import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  getProposalStateVariant,
  ProposalStateBadge,
} from './ProposalStateBadge';

describe('ProposalStateBadge', () => {
  it('spells out the state rather than showing the raw enum', () => {
    // state-check: ignore — a proposal state, not a UI-Router state name.
    render(<ProposalStateBadge state="in_review" />); // state-check: ignore
    expect(screen.getByText('In review')).toBeInTheDocument();
  });

  // proposal_state is typed as a plain string by the schema.
  it('renders nothing without a state', () => {
    render(<ProposalStateBadge state={undefined} />);
    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });
});

describe('getProposalStateVariant', () => {
  it.each([
    ['accepted', 'success'],
    ['rejected', 'danger'],
    // Waiting on someone else.
    ['in_review', 'warning'],
    ['submitted', 'warning'],
    // Not yet in flight, or withdrawn.
    ['draft', 'secondary'],
    ['canceled', 'secondary'],
  ] as const)('maps %s to %s', (state, variant) => {
    expect(getProposalStateVariant(state)).toBe(variant);
  });
});
