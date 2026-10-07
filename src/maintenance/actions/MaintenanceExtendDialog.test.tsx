import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MaintenanceExtendDialog } from './MaintenanceExtendDialog';

vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const mockMaintenance = {
  uuid: 'test-maint-uuid',
  scheduled_end: '2050-06-01T12:00:00Z',
  internal_notes: '',
} as any;

describe('MaintenanceExtendDialog', () => {
  it('renders quick extend action buttons with accessible group and aria-pressed attributes', () => {
    render(
      <MaintenanceExtendDialog
        resolve={{
          maintenance: mockMaintenance,
          refetch: vi.fn(),
        }}
      />,
    );

    const group = screen.getByRole('group', { name: 'Quick extend options' });
    expect(group).toBeInTheDocument();

    const btn30m = screen.getByRole('button', { name: '+30 min' });
    const btn1h = screen.getByRole('button', { name: '+1 h' });
    const btn2h = screen.getByRole('button', { name: '+2 h' });
    const btn4h = screen.getByRole('button', { name: '+4 h' });

    expect(btn30m).toHaveAttribute('aria-pressed', 'true');
    expect(btn1h).toHaveAttribute('aria-pressed', 'false');
    expect(btn2h).toHaveAttribute('aria-pressed', 'false');
    expect(btn4h).toHaveAttribute('aria-pressed', 'false');
  });

  it('updates aria-pressed and field when a quick extend preset is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MaintenanceExtendDialog
        resolve={{
          maintenance: mockMaintenance,
          refetch: vi.fn(),
        }}
      />,
    );

    const btn30m = screen.getByRole('button', { name: '+30 min' });
    const btn1h = screen.getByRole('button', { name: '+1 h' });

    expect(btn30m).toHaveAttribute('aria-pressed', 'true');
    expect(btn1h).toHaveAttribute('aria-pressed', 'false');

    await user.click(btn1h);

    expect(btn1h).toHaveAttribute('aria-pressed', 'true');
    expect(btn30m).toHaveAttribute('aria-pressed', 'false');
  });
});
