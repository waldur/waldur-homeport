import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { CallCard } from './CallCard';

// The apply button runs its own eligibility queries; the card is under test.
vi.mock('./details/PublicCallApplyButton', () => ({
  PublicCallApplyButton: () => null,
}));

const call = {
  uuid: 'call-uuid',
  name: 'Production Call',
  customer_name: 'Organisation',
  description: '',
  state: 'active',
  rounds: [],
  fixed_duration_in_days: null,
  image: null,
} as any;

describe('CallCard', () => {
  it('shows the initials of the call name when it has no logo', () => {
    renderWithProviders(<CallCard call={call} />);
    expect(screen.getByText('PC')).toBeInTheDocument();
  });

  it('shows the logo in place of the initials', () => {
    renderWithProviders(
      <CallCard call={{ ...call, image: '/api/media/logo/' }} />,
    );
    expect(screen.getByText('Production Call')).toBeInTheDocument();
    expect(screen.queryByText('PC')).not.toBeInTheDocument();
  });
});
