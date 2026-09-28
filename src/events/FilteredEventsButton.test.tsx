import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { useModal } from '@/modal/actions';

import { FilteredEventsButton } from './FilteredEventsButton';

describe('FilteredEventsButton', () => {
  const mockOpenDialog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useModal as Mock).mockReturnValue({
      openDialog: mockOpenDialog,
      closeDialog: vi.fn(),
    });
  });

  it('renders BaseButton with label and default size/variant', () => {
    render(<FilteredEventsButton filter={{ feature: 'credits' }} />);

    const button = screen.getByRole('button', { name: /history log/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('History log');
    expect(button).toHaveClass('py-[10px]'); // size="lg"
    expect(button).toHaveClass('bg-[var(--btn-secondary-bg)]'); // variant="secondary"
  });

  it('opens dialog with filter when clicked', async () => {
    const user = userEvent.setup();
    render(<FilteredEventsButton filter={{ scope: 'test-scope' }} />);

    const button = screen.getByRole('button', { name: /history log/i });
    await user.click(button);

    expect(mockOpenDialog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        size: 'xl',
        filter: { scope: 'test-scope' },
      }),
    );
  });
});
