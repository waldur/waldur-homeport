import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  externalLinksCreate,
  externalLinksPartialUpdate,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { QuickShortcutForm } from './QuickShortcutForm';

describe('QuickShortcutForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (shortcut?: any, refetch = vi.fn()) => {
    return renderWithProviders(
      <QuickShortcutForm
        resolve={{
          shortcut,
          refetch,
        }}
      />,
    );
  };

  it('renders create mode correctly', () => {
    renderComponent();

    expect(screen.getByText('Create quick shortcut')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();

    expect(screen.getByLabelText(/Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Link/i)).toHaveValue('');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('');
    expect(screen.getByText(/Upload an image/i)).toBeInTheDocument();
  });

  it('renders edit mode correctly', () => {
    const mockShortcut = {
      uuid: 'shortcut-uuid',
      name: 'Test Shortcut',
      link: 'https://example.com',
      description: 'Test Description',
      image: 'test-image.png',
    };

    renderComponent(mockShortcut);

    expect(
      screen.getByText('Edit quick shortcut for Test Shortcut'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();

    expect(screen.getByLabelText(/Name/i)).toHaveValue('Test Shortcut');
    expect(screen.getByLabelText(/Link/i)).toHaveValue('https://example.com');
    expect(screen.getByLabelText(/Description/i)).toHaveValue(
      'Test Description',
    );
  });

  it('validates required fields', async () => {
    renderComponent();

    const submitButton = screen.getByRole('button', { name: 'Create' });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText(/Name/i), 'New Shortcut');
    // Link is still missing
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText(/Link/i), 'https://example.com');
    expect(submitButton).not.toBeDisabled();
  });

  it('validates URL format', async () => {
    renderComponent();

    const submitButton = screen.getByRole('button', { name: 'Create' });
    const nameInput = screen.getByLabelText(/Name/i);
    const linkInput = screen.getByLabelText(/Link/i);

    await user.type(nameInput, 'New Shortcut');
    // ftp is invalid protocol in our validator
    await user.type(linkInput, 'ftp://example.com');
    await user.tab(); // Blur to trigger touched state

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
    expect(screen.getByText(/Please enter a valid URL/i)).toBeInTheDocument();

    await user.clear(linkInput);
    await user.type(linkInput, 'https://valid-url.com');
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('handles creation submission successfully', async () => {
    const mockRefetch = vi.fn();
    vi.mocked(externalLinksCreate).mockResolvedValue({ data: {} } as any);

    renderComponent(null, mockRefetch);

    await user.type(screen.getByLabelText(/Name/i), 'New Shortcut');
    await user.type(screen.getByLabelText(/Link/i), 'https://example.com');
    await user.type(screen.getByLabelText(/Description/i), 'New Description');

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(externalLinksCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            name: 'New Shortcut',
            link: 'https://example.com',
            description: 'New Description',
          }),
        }),
      );
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles edit submission successfully', async () => {
    const mockRefetch = vi.fn();
    const mockShortcut = {
      uuid: 'shortcut-uuid',
      name: 'Old Shortcut',
      link: 'https://old.com',
    };

    vi.mocked(externalLinksPartialUpdate).mockResolvedValue({
      data: {},
    } as any);

    renderComponent(mockShortcut, mockRefetch);

    const nameInput = screen.getByLabelText(/Name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Shortcut');

    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(externalLinksPartialUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'shortcut-uuid' },
          body: expect.objectContaining({
            name: 'Updated Shortcut',
          }),
        }),
      );
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles image upload', async () => {
    renderComponent();

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByTestId('image-input') as HTMLInputElement;

    await user.upload(input, file);

    expect(screen.getByText('Replace')).toBeInTheDocument();
  });
});
