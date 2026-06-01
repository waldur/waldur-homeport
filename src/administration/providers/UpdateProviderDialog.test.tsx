import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { identityProvidersUpdate, overrideSettings } from 'waldur-js-client';

import { FREEIPA_IDP } from '@/auth/providers/constants';
import { ENV } from '@/core/config';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { UpdateProviderDialog } from './UpdateProviderDialog';

describe('UpdateProviderDialog', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    ENV.plugins = {
      WALDUR_CORE: {},
    } as any;
  });

  it('renders ProviderFreeIPAForm when type is FREEIPA_IDP', () => {
    const resolve = {
      provider: { provider: 'freeipa', FREEIPA_HOSTNAME: 'ipa.example.com' },
      type: FREEIPA_IDP,
      refetch: mockRefetch,
    };

    renderWithProviders(<UpdateProviderDialog resolve={resolve} />);

    expect(
      screen.getByText('Update identity provider: freeipa'),
    ).toBeInTheDocument();
    expect(screen.getByText('Freeipa hostname')).toBeInTheDocument();
    expect(screen.queryByText('Client ID')).not.toBeInTheDocument();
  });

  it('renders ProviderForm when type is not FREEIPA_IDP', () => {
    const resolve = {
      provider: {
        provider: 'oidc',
        label: 'OIDC Provider',
        client_id: '123',
        client_secret: 'secret',
        discovery_url: 'https://example.com',
      },
      type: 'OIDC',
      refetch: mockRefetch,
    };

    renderWithProviders(<UpdateProviderDialog resolve={resolve} />);

    expect(
      screen.getByText('Update identity provider: OIDC'),
    ).toBeInTheDocument();
    expect(screen.getByText('Client ID')).toBeInTheDocument();
    expect(screen.queryByText('Freeipa hostname')).not.toBeInTheDocument();
  });

  it('submits via overrideSettings and updates ENV when type is FREEIPA_IDP', async () => {
    const user = userEvent.setup();
    const resolve = {
      provider: {
        provider: 'freeipa',
        is_active: true,
        FREEIPA_HOSTNAME: 'ipa.example.com',
      },
      type: FREEIPA_IDP,
      refetch: mockRefetch,
    };

    vi.mocked(overrideSettings).mockResolvedValue({} as any);

    renderWithProviders(<UpdateProviderDialog resolve={resolve} />);

    // Click Save to trigger form submission
    await user.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      // should call overrideSettings with body excluding is_active
      expect(overrideSettings).toHaveBeenCalledWith({
        body: {
          provider: 'freeipa',
          FREEIPA_HOSTNAME: 'ipa.example.com',
        },
      });
    });

    // should update ENV keys
    expect(ENV.plugins.WALDUR_CORE['FREEIPA_HOSTNAME']).toBe('ipa.example.com');
    expect(ENV.plugins.WALDUR_CORE['provider']).toBe('freeipa');
    expect(ENV.plugins.WALDUR_CORE['is_active']).toBeUndefined();

    // should call refetch
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('submits via identityProvidersUpdate when type is not FREEIPA_IDP', async () => {
    const user = userEvent.setup();
    const resolve = {
      provider: {
        provider: 'oidc',
        label: 'OIDC Provider',
        client_id: '123',
        client_secret: 'secret',
        discovery_url: 'https://example.com',
      },
      type: 'OIDC',
      refetch: mockRefetch,
    };

    vi.mocked(identityProvidersUpdate).mockResolvedValue({} as any);

    renderWithProviders(<UpdateProviderDialog resolve={resolve} />);

    await user.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(identityProvidersUpdate).toHaveBeenCalledWith({
        path: { provider: 'oidc' },
        body: {
          provider: 'oidc',
          label: 'OIDC Provider',
          client_id: '123',
          client_secret: 'secret',
          discovery_url: 'https://example.com',
        },
      });
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('disables Save button when required fields are empty/invalid', async () => {
    const user = userEvent.setup();
    const resolve = {
      provider: {
        provider: 'oidc',
        label: '', // empty label
        client_id: '123',
        client_secret: 'secret',
        discovery_url: 'https://example.com',
      },
      type: 'OIDC',
      refetch: mockRefetch,
    };

    renderWithProviders(<UpdateProviderDialog resolve={resolve} />);

    // Save button should be disabled because label is empty (required)
    const saveButton = screen.getByRole('button', { name: /Save/i });
    expect(saveButton).toBeDisabled();

    // Now type a value in the label field
    const labelInput = screen.getByLabelText(/Label/i);
    await user.type(labelInput, 'My Label');

    // It should now be enabled
    expect(saveButton).toBeEnabled();
  });

  it('validates and submits allowed redirect URIs', async () => {
    const user = userEvent.setup();
    const resolve = {
      provider: {
        provider: 'oidc',
        label: 'OIDC Provider',
        client_id: '123',
        client_secret: 'secret',
        discovery_url: 'https://example.com',
      },
      type: 'OIDC',
      refetch: mockRefetch,
    };

    renderWithProviders(<UpdateProviderDialog resolve={resolve} />);

    // Click "Add URL" button
    await user.click(screen.getByRole('button', { name: /Add URL/i }));

    // An input field for redirect URI should appear
    const urlInput = screen.getByPlaceholderText('https://example.com');
    expect(urlInput).toBeInTheDocument();

    // Type an invalid URL (e.g. without protocol or containing path)
    await user.type(urlInput, 'invalid-url');

    // Save button should be disabled due to validation error
    const saveButton = screen.getByRole('button', { name: /Save/i });
    expect(saveButton).toBeDisabled();

    // Clear the input and type a valid redirect URI (origin-only)
    await user.clear(urlInput);
    await user.type(urlInput, 'https://my-app.com');

    // Save button should be enabled
    expect(saveButton).toBeEnabled();

    // Submit and check if allowed_redirects is in the payload
    vi.mocked(identityProvidersUpdate).mockResolvedValue({} as any);
    await user.click(saveButton);

    await waitFor(() => {
      expect(identityProvidersUpdate).toHaveBeenCalledWith({
        path: { provider: 'oidc' },
        body: expect.objectContaining({
          allowed_redirects: ['https://my-app.com'],
        }),
      });
    });
  });

  it('handles error when overrideSettings fails for FREEIPA_IDP', async () => {
    const user = userEvent.setup();
    const resolve = {
      provider: {
        provider: 'freeipa',
        FREEIPA_HOSTNAME: 'ipa.example.com',
      },
      type: FREEIPA_IDP,
      refetch: mockRefetch,
    };

    const error = new Error('API Error');
    vi.mocked(overrideSettings).mockRejectedValue(error);

    renderWithProviders(<UpdateProviderDialog resolve={resolve} />);

    await user.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to update identity provider.',
      );
    });
    expect(mockRefetch).not.toHaveBeenCalled();
  });

  it('handles error when identityProvidersUpdate fails for non-FREEIPA_IDP', async () => {
    const user = userEvent.setup();
    const resolve = {
      provider: {
        provider: 'oidc',
        label: 'OIDC Provider',
        client_id: '123',
        client_secret: 'secret',
        discovery_url: 'https://example.com',
      },
      type: 'OIDC',
      refetch: mockRefetch,
    };

    const error = new Error('API Error');
    vi.mocked(identityProvidersUpdate).mockRejectedValue(error);

    renderWithProviders(<UpdateProviderDialog resolve={resolve} />);

    await user.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to update identity provider.',
      );
    });
    expect(mockRefetch).not.toHaveBeenCalled();
  });
});
