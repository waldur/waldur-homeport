import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ProposalEditLock } from './ProposalEditLock';

const proposal = { uuid: 'p1', created_by_name: 'Linus Pauling' } as any;

describe('ProposalEditLock', () => {
  it('unlocks only once the outsider confirms whose proposal it is', async () => {
    const confirm = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useModal).mockReturnValue({ confirm } as any);
    vi.mocked(useUser).mockReturnValue({
      uuid: 'staff',
      is_staff: true,
    } as any);
    const onChange = vi.fn();
    renderWithProviders(
      <ProposalEditLock
        proposal={proposal}
        unlocked={false}
        formEditable
        onChange={onChange}
      />,
    );

    expect(screen.getByTestId('proposal-edit-locked')).toHaveTextContent(
      'Linus Pauling’s team',
    );
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Unlock editing' }));
    expect(confirm).toHaveBeenCalledWith(
      'Edit someone else’s proposal?',
      expect.stringContaining('Linus Pauling'),
      { positiveButton: 'Unlock editing' },
    );
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(true));
  });

  it('stays locked when the confirmation is cancelled', async () => {
    vi.mocked(useModal).mockReturnValue({
      confirm: vi.fn().mockRejectedValue(undefined),
    } as any);
    vi.mocked(useUser).mockReturnValue({
      uuid: 'staff',
      is_staff: true,
    } as any);
    const onChange = vi.fn();
    renderWithProviders(
      <ProposalEditLock
        proposal={proposal}
        unlocked={false}
        formEditable
        onChange={onChange}
      />,
    );
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Unlock editing' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps saying so while unlocked, and locks again', async () => {
    vi.mocked(useModal).mockReturnValue({ confirm: vi.fn() } as any);
    vi.mocked(useUser).mockReturnValue({
      uuid: 'staff',
      is_staff: true,
    } as any);
    const onChange = vi.fn();
    renderWithProviders(
      <ProposalEditLock
        proposal={proposal}
        unlocked
        formEditable
        onChange={onChange}
      />,
    );
    expect(screen.getByTestId('proposal-edit-unlocked')).toHaveTextContent(
      'You are editing Linus Pauling’s proposal',
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Lock' }));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('offers a submitted proposal’s team only, and says how its answers change', async () => {
    const confirm = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useModal).mockReturnValue({ confirm } as any);
    vi.mocked(useUser).mockReturnValue({
      uuid: 'staff',
      is_staff: true,
    } as any);
    const onChange = vi.fn();
    renderWithProviders(
      <ProposalEditLock
        proposal={proposal}
        unlocked={false}
        formEditable={false}
        onChange={onChange}
      />,
    );
    expect(screen.getByTestId('proposal-edit-locked')).toHaveTextContent(
      'asked for changes',
    );
    expect(
      screen.queryByRole('button', { name: 'Unlock editing' }),
    ).not.toBeInTheDocument();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Unlock team changes' }));
    expect(confirm).toHaveBeenCalledWith(
      'Change someone else’s proposal team?',
      expect.stringContaining('Linus Pauling'),
      { positiveButton: 'Unlock team changes' },
    );
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(true));
  });
});
