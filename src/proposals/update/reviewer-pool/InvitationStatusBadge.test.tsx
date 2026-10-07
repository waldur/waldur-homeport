import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  getInvitationStatusVariant,
  InvitationStatusBadge,
} from './InvitationStatusBadge';

describe('getInvitationStatusVariant', () => {
  it.each([
    ['accepted', 'success'],
    ['pending', 'warning'],
    ['declined', 'danger'],
    ['expired', 'secondary'],
    // A status the backend adds later still renders, just neutrally.
    ['unknown', 'primary'],
  ])('maps %s to %s', (status, variant) => {
    expect(getInvitationStatusVariant(status)).toBe(variant);
  });
});

describe('InvitationStatusBadge', () => {
  it('shows the display label, not the raw status', () => {
    render(
      <InvitationStatusBadge
        status="pending"
        statusDisplay="Invitation pending"
      />,
    );
    expect(screen.getByText('Invitation pending')).toBeInTheDocument();
  });

  // A reviewer reading their own invitation gets no hint.
  it('adds no hint icon unless one is passed', () => {
    render(
      <InvitationStatusBadge
        status="pending"
        statusDisplay="Invitation pending"
      />,
    );
    expect(screen.queryByTestId('QuestionIcon')).not.toBeInTheDocument();
  });

  it('adds the hint icon to a pending invitation', () => {
    render(
      <InvitationStatusBadge
        status="pending"
        statusDisplay="Invitation pending"
        pendingHint="Not yet accepted."
      />,
    );
    expect(screen.getByTestId('QuestionIcon')).toBeInTheDocument();
  });

  it('drops the hint once the invitation is answered', () => {
    render(
      <InvitationStatusBadge
        status="accepted"
        statusDisplay="Accepted"
        pendingHint="Not yet accepted."
      />,
    );
    expect(screen.queryByTestId('QuestionIcon')).not.toBeInTheDocument();
  });
});
