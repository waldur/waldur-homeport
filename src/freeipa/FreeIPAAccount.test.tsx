import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { freeipaProfilesList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';
import * as workspaceHooks from '@/workspace/hooks';

import { FreeIpaAccount } from './FreeIPAAccount';

ENV.plugins.WALDUR_CORE.FREEIPA_ENABLED = true;
ENV.plugins.WALDUR_CORE.FREEIPA_USERNAME_PREFIX = 'test_';

describe('FreeIpaAccount', () => {
  beforeEach(() => {
    vi.mocked(workspaceHooks.useUser).mockReturnValue({
      username: 'testuser',
      uuid: 'test-uuid',
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the create-profile form (not an error) when the user has no profile', async () => {
    // Empty list -> undefined result; without the `?? null` fix this showed an error.
    vi.mocked(freeipaProfilesList).mockResolvedValue(mockListResponse([]));

    renderWithProviders(<FreeIpaAccount />);

    expect(
      await screen.findByRole('button', { name: /create/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Unable to load data.')).not.toBeInTheDocument();
    expect(freeipaProfilesList).toHaveBeenCalledWith({
      query: { user: 'test-uuid' },
    });
  });

  it('renders the existing profile (edit view) when the user already has one', async () => {
    vi.mocked(freeipaProfilesList).mockResolvedValue(
      mockListResponse([
        { uuid: 'p1', username: 'test_testuser', is_active: true },
      ]),
    );

    renderWithProviders(<FreeIpaAccount />);

    expect(await screen.findByText('Profile is enabled.')).toBeInTheDocument();
    expect(screen.queryByText('Unable to load data.')).not.toBeInTheDocument();
  });

  it('shows the error state when the profiles request actually fails', async () => {
    vi.mocked(freeipaProfilesList).mockRejectedValue(new Error('boom'));

    renderWithProviders(<FreeIpaAccount />);

    expect(await screen.findByText('Unable to load data.')).toBeInTheDocument();
  });
});
