import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { useUser } from '@/workspace/hooks';

import { VersionHistoryButton } from './VersionHistoryButton';

describe('VersionHistoryButton', () => {
  const mockOpenDialog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useModal as Mock).mockReturnValue({
      openDialog: mockOpenDialog,
      closeDialog: vi.fn(),
    });
  });

  it('renders nothing when user is neither staff nor support', () => {
    (useUser as Mock).mockReturnValue({ is_staff: false, is_support: false });
    const { container } = render(
      <VersionHistoryButton
        entityType="user"
        entityUuid="test-uuid"
        entityName="John Doe"
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders BaseButton with label and correct default variant and size for staff', () => {
    (useUser as Mock).mockReturnValue({ is_staff: true, is_support: false });
    render(
      <VersionHistoryButton
        entityType="user"
        entityUuid="test-uuid"
        entityName="John Doe"
      />,
    );

    const button = screen.getByRole('button', { name: /version history/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Version history');
    expect(button).toHaveClass('py-[10px]'); // size="lg"
    expect(button).toHaveClass('bg-[var(--btn-secondary-bg)]'); // variant="secondary"
  });

  it('opens dialog with entity details when clicked', async () => {
    const user = userEvent.setup();
    (useUser as Mock).mockReturnValue({ is_staff: false, is_support: true });
    render(
      <VersionHistoryButton
        entityType="user"
        entityUuid="test-uuid"
        entityName="John Doe"
      />,
    );

    const button = screen.getByRole('button', { name: /version history/i });
    await user.click(button);

    expect(mockOpenDialog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        size: 'xl',
        entityType: 'user',
        entityUuid: 'test-uuid',
        entityName: 'John Doe',
      }),
    );
  });

  it('supports custom size and variant', () => {
    (useUser as Mock).mockReturnValue({ is_staff: true, is_support: false });
    render(
      <VersionHistoryButton
        entityType="plan"
        entityUuid="plan-uuid"
        entityName="Standard Plan"
        size="sm"
        variant="tertiary"
      />,
    );

    const button = screen.getByRole('button', { name: /version history/i });
    expect(button).toHaveClass('py-[4px]'); // size="sm"
    expect(button).toHaveClass('bg-[var(--btn-tertiary-bg)]'); // variant="tertiary"
  });
});
