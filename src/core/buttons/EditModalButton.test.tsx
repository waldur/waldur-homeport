import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC } from 'react';
import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';

import { useModal } from '@/modal/actions';

import { EditModalButton } from './EditModalButton';

vi.mock('@/marketplace/resources/actions/ResourceActionMenuContext', () => ({
  ResourceActionMenuContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}));

interface MockRow {
  uuid: string;
  name: string;
}

const MockDialog: FC<{
  resolve: { uuid: string; refetch: () => void };
}> = () => <div>Mock Dialog</div>;

describe('EditModalButton', () => {
  const mockOpenDialog = vi.fn();
  const mockRow: MockRow = { uuid: 'test-uuid', name: 'Test Item' };

  beforeEach(() => {
    vi.clearAllMocks();
    (useModal as Mock).mockReturnValue({
      openDialog: mockOpenDialog,
      closeDialog: vi.fn(),
    });
  });

  it('renders action item with default title', () => {
    render(
      <EditModalButton
        dialog={MockDialog}
        row={mockRow}
        resolve={{ uuid: mockRow.uuid, refetch: vi.fn() }}
      />,
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(
      <EditModalButton
        dialog={MockDialog}
        row={mockRow}
        resolve={{ uuid: mockRow.uuid, refetch: vi.fn() }}
        title="Update"
      />,
    );

    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('calls buildResolve with row to create resolve props', async () => {
    const user = userEvent.setup();
    const buildResolve = vi.fn((row: MockRow) => ({
      uuid: row.uuid,
      refetch: vi.fn(),
    }));

    render(
      <EditModalButton
        dialog={MockDialog}
        row={mockRow}
        buildResolve={buildResolve}
      />,
    );

    await user.click(screen.getByText('Edit'));

    expect(buildResolve).toHaveBeenCalledWith(mockRow);
    expect(mockOpenDialog).toHaveBeenCalledWith(
      MockDialog,
      expect.objectContaining({
        resolve: expect.objectContaining({ uuid: 'test-uuid' }),
      }),
    );
  });

  it('calls getInitialValues with row', async () => {
    const user = userEvent.setup();
    const getInitialValues = vi.fn((row: MockRow) => ({
      name: row.name,
      description: '',
    }));

    render(
      <EditModalButton
        dialog={MockDialog}
        row={mockRow}
        resolve={{ uuid: mockRow.uuid, refetch: vi.fn() }}
        getInitialValues={getInitialValues}
      />,
    );

    await user.click(screen.getByText('Edit'));

    expect(getInitialValues).toHaveBeenCalledWith(mockRow);
    expect(mockOpenDialog).toHaveBeenCalledWith(
      MockDialog,
      expect.objectContaining({
        initialValues: { name: 'Test Item', description: '' },
      }),
    );
  });

  it('opens dialog with correct size', async () => {
    const user = userEvent.setup();
    render(
      <EditModalButton
        dialog={MockDialog}
        row={mockRow}
        resolve={{ uuid: mockRow.uuid, refetch: vi.fn() }}
        size="xl"
      />,
    );

    await user.click(screen.getByText('Edit'));

    expect(mockOpenDialog).toHaveBeenCalledWith(
      MockDialog,
      expect.objectContaining({ size: 'xl' }),
    );
  });

  it('renders as button when renderAs is button', () => {
    render(
      <EditModalButton
        dialog={MockDialog}
        row={mockRow}
        resolve={{ uuid: mockRow.uuid, refetch: vi.fn() }}
        renderAs="button"
      />,
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Edit');
  });

  it('renders disabled when disabled prop is true', () => {
    render(
      <EditModalButton
        dialog={MockDialog}
        row={mockRow}
        resolve={{ uuid: mockRow.uuid, refetch: vi.fn() }}
        renderAs="button"
        disabled
      />,
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('uses default size lg when not specified', async () => {
    const user = userEvent.setup();
    render(
      <EditModalButton
        dialog={MockDialog}
        row={mockRow}
        resolve={{ uuid: mockRow.uuid, refetch: vi.fn() }}
      />,
    );

    await user.click(screen.getByText('Edit'));

    expect(mockOpenDialog).toHaveBeenCalledWith(
      MockDialog,
      expect.objectContaining({ size: 'lg' }),
    );
  });
});
