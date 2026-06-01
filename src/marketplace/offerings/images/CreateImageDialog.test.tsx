import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceScreenshotsCreate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { CreateImageDialog } from './CreateImageDialog';

describe('CreateImageDialog', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (
    offering = { url: 'offering-url' },
    refetch = vi.fn(),
  ) => {
    return renderWithProviders(
      <CreateImageDialog
        resolve={{
          offering,
          refetch,
        }}
      />,
    );
  };

  it('renders correctly', () => {
    renderComponent();

    expect(screen.getByText('Add offering image')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();

    expect(screen.getByLabelText(/Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('');
    expect(screen.getByText(/Upload an image/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderComponent();

    const submitButton = screen.getByRole('button', { name: 'Confirm' });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText(/Name/i), 'Test Image');
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText(/Description/i), 'Test Description');
    expect(submitButton).toBeDisabled();

    // Still disabled because image is required
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByTestId('image-input') as HTMLInputElement;
    await user.upload(input, file);

    expect(submitButton).not.toBeDisabled();
  });

  it('handles submission successfully', async () => {
    const mockRefetch = vi.fn();
    vi.mocked(marketplaceScreenshotsCreate).mockResolvedValue({
      data: {},
    } as any);

    renderComponent({ url: 'offering-url' }, mockRefetch);

    await user.type(screen.getByLabelText(/Name/i), 'Test Image');
    await user.type(screen.getByLabelText(/Description/i), 'Test Description');

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByTestId('image-input') as HTMLInputElement;
    await user.upload(input, file);

    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(marketplaceScreenshotsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            name: 'Test Image',
            description: 'Test Description',
            offering: 'offering-url',
          }),
        }),
      );
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles image upload and replacement', async () => {
    renderComponent();

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByTestId('image-input') as HTMLInputElement;

    await user.upload(input, file);
    expect(screen.getByText('Replace')).toBeInTheDocument();

    const file2 = new File(['world'], 'world.png', { type: 'image/png' });
    await user.upload(input, file2);
    expect(screen.getByText('Replace')).toBeInTheDocument();
  });
});
