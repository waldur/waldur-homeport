import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { FC } from 'react';
import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';

import { useModal } from '@waldur/modal/hooks';

import { CreateModalButton } from './CreateModalButton';

vi.mock('@waldur/modal/hooks', () => ({
  useModal: vi.fn(),
}));

vi.mock('@waldur/i18n', () => ({
  translate: (str: string) => str,
}));

const MockDialog: FC<{ resolve: { refetch: () => void } }> = () => (
  <div>Mock Dialog</div>
);

describe('CreateModalButton', () => {
  const mockOpenDialog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useModal as Mock).mockReturnValue({
      openDialog: mockOpenDialog,
      closeDialog: vi.fn(),
    });
  });

  it('renders button with default title and icon', () => {
    render(
      <CreateModalButton dialog={MockDialog} resolve={{ refetch: vi.fn() }} />,
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Add');
  });

  it('renders button with custom title', () => {
    render(
      <CreateModalButton
        dialog={MockDialog}
        resolve={{ refetch: vi.fn() }}
        title="Create New Item"
      />,
    );

    expect(screen.getByRole('button')).toHaveTextContent('Create New Item');
  });

  it('opens dialog with correct props when clicked', () => {
    const refetch = vi.fn();
    render(
      <CreateModalButton
        dialog={MockDialog}
        resolve={{ refetch }}
        size="xl"
        dialogClassName="modal-dialog-centered"
      />,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockOpenDialog).toHaveBeenCalledTimes(1);
    expect(mockOpenDialog).toHaveBeenCalledWith(MockDialog, {
      resolve: { refetch },
      size: 'xl',
      dialogClassName: 'modal-dialog-centered',
      formId: undefined,
      initialValues: undefined,
    });
  });

  it('renders disabled button when disabled prop is true', () => {
    render(
      <CreateModalButton
        dialog={MockDialog}
        resolve={{ refetch: vi.fn() }}
        disabled
      />,
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders with different variant', () => {
    render(
      <CreateModalButton
        dialog={MockDialog}
        resolve={{ refetch: vi.fn() }}
        variant="secondary"
      />,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-secondary');
  });

  it('uses default size lg when not specified', () => {
    render(
      <CreateModalButton dialog={MockDialog} resolve={{ refetch: vi.fn() }} />,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockOpenDialog).toHaveBeenCalledWith(
      MockDialog,
      expect.objectContaining({ size: 'lg' }),
    );
  });

  it('passes initialValues to dialog', () => {
    const initialValues = { name: 'Test' };
    render(
      <CreateModalButton
        dialog={MockDialog}
        resolve={{ refetch: vi.fn() }}
        initialValues={initialValues}
      />,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockOpenDialog).toHaveBeenCalledWith(
      MockDialog,
      expect.objectContaining({ initialValues }),
    );
  });
});
