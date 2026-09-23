import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createTestWrapper } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { RecalculateUserActionsButton } from './RecalculateUserActionsButton';

describe('RecalculateUserActionsButton', () => {
  it('renders as a standalone button outside of a menu for staff', () => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    const { wrapper } = createTestWrapper();

    render(<RecalculateUserActionsButton />, { wrapper });

    expect(
      screen.getByRole('button', { name: 'Recalculate user actions' }),
    ).toBeInTheDocument();
  });
});
