import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockExchangeToken,
  mockLoginUser,
  mockRedirectOnSuccess,
  mockCheckAndRequest,
  mockRedirectGet,
  mockRedirectRemove,
} = vi.hoisted(() => ({
  mockExchangeToken: vi.fn(),
  mockLoginUser: vi.fn(),
  mockRedirectOnSuccess: vi.fn(),
  mockCheckAndRequest: vi.fn(),
  mockRedirectGet: vi.fn(),
  mockRedirectRemove: vi.fn(),
}));

vi.mock('../AuthService', () => ({
  exchangeToken: mockExchangeToken,
  loginUser: mockLoginUser,
}));

vi.mock('../authNavigation', () => ({
  redirectOnSuccess: mockRedirectOnSuccess,
}));

vi.mock('@/invitations/join-organization/submission', () => ({
  useRequestToAccessOrganization: () => ({
    checkAndRequest: mockCheckAndRequest,
  }),
}));

vi.mock('@/core/StorageManager', () => ({
  RedirectStorage: {
    get: mockRedirectGet,
    remove: mockRedirectRemove,
  },
}));

vi.mock('@/core/utils', () => ({
  getQueryString: () => 'code=abc',
}));

vi.mock('@/core/Link', () => ({
  Link: ({ children }) => <span>{children}</span>,
}));

import { OauthLoginCompleted } from './OauthLoginCompleted';

describe('OauthLoginCompleted', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExchangeToken.mockResolvedValue('api-token');
    mockLoginUser.mockResolvedValue(undefined);
    mockRedirectGet.mockReturnValue(null);
  });

  it('should skip redirectOnSuccess when the invitation flow handled navigation', async () => {
    mockCheckAndRequest.mockResolvedValue(true);

    render(<OauthLoginCompleted />);

    await waitFor(() => expect(mockCheckAndRequest).toHaveBeenCalled());
    await waitFor(() => expect(mockRedirectRemove).toHaveBeenCalled());
    expect(mockRedirectOnSuccess).not.toHaveBeenCalled();
  });

  it('should redirect as usual when no invitation was handled', async () => {
    mockCheckAndRequest.mockResolvedValue(false);

    render(<OauthLoginCompleted />);

    await waitFor(() => expect(mockRedirectOnSuccess).toHaveBeenCalled());
    expect(mockRedirectRemove).not.toHaveBeenCalled();
  });

  it('should not run the invitation check when redirecting to the invitation route', async () => {
    mockRedirectGet.mockReturnValue({ toState: 'user-group-invitation' });

    render(<OauthLoginCompleted />);

    await waitFor(() => expect(mockRedirectOnSuccess).toHaveBeenCalled());
    expect(mockCheckAndRequest).not.toHaveBeenCalled();
  });
});
