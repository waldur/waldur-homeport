import { onlineManager } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCurrentStateAndParams } from '@uirouter/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ConsentDetails,
  oauthConsent,
  oauthConsentRetrieve,
  User,
} from 'waldur-js-client';

import { queryClient } from '@/core/queryClient';
import { ImpersonationStorage, RedirectStorage } from '@/core/StorageManager';
import { router } from '@/router';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import { UsersService } from '@/user/UsersService';
import { useUser } from '@/workspace/hooks';

import {
  getConsentRequest,
  OAuthConsentPage,
  RETURN_DELAY_MS,
} from './OAuthConsentPage';

// The frame reuses the sign-in page's header and footer, which need the app's
// config and store; these tests are about the consent card.
vi.mock('./ConsentPageLayout', () => ({
  ConsentPageLayout: ({ children }) => children,
}));

// Rebuilding the API client needs a configured auth core.
vi.mock('@/core/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/core/api')>()),
  getHeaders: vi.fn(),
  initApiClient: vi.fn(),
}));

const params = {
  client_id: 'abc',
  redirect_uri: 'http://127.0.0.1:33418/callback',
  response_type: 'code',
  scope: 'mcp:read',
  state: 'xyz',
  code_challenge: 'challenge',
  code_challenge_method: 'S256',
  resource: ['https://waldur.example.com/mcp'],
  '#': null,
};

const { showErrorResponse } = useNotify();

const REQUEST = {
  client_id: 'abc',
  redirect_uri: 'http://127.0.0.1:33418/callback',
  response_type: 'code',
  scope: 'mcp:read',
  state: 'xyz',
  code_challenge: 'challenge',
  code_challenge_method: 'S256',
  resource: ['https://waldur.example.com/mcp'],
};

const details = (overrides: Partial<ConsentDetails> = {}): ConsentDetails => ({
  client_name: 'Claude',
  client_host: null,
  redirect_host: '127.0.0.1',
  registration_source: 'dcr',
  scopes: [{ name: 'mcp:read', description: 'Read your Waldur data' }],
  elevated_access: null,
  ...overrides,
});

// The shape the SDK error interceptor gives a failed request.
const httpError = (status: number, body: object = {}) => ({
  ...body,
  data: body,
  status,
  response: { status },
});

const mockDetails = (value: ConsentDetails) =>
  vi
    .mocked(oauthConsentRetrieve)
    .mockResolvedValue({ data: value } as Awaited<
      ReturnType<typeof oauthConsentRetrieve>
    >);

const renderPage = () => renderWithProviders(<OAuthConsentPage />);

let replace: ReturnType<typeof vi.fn<(url: string | URL) => void>>;

beforeEach(() => {
  vi.clearAllMocks();
  // clearAllMocks keeps a previous test's mocked responses.
  vi.mocked(oauthConsentRetrieve).mockReset();
  vi.mocked(oauthConsent).mockReset();
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: {},
    params,
  } as ReturnType<typeof useCurrentStateAndParams>);
  vi.mocked(useUser).mockReturnValue({
    full_name: 'Alice Doe',
    email: 'alice@example.com',
    username: 'alice',
  } as User);
  replace = vi.fn<(url: string | URL) => void>();
  vi.spyOn(window.location, 'replace').mockImplementation(replace);
});

afterEach(() => {
  vi.restoreAllMocks();
  ImpersonationStorage.remove();
});

describe('getConsentRequest', () => {
  it('keeps the OAuth parameters and drops the rest', () => {
    expect(getConsentRequest(params)).toEqual(REQUEST);
  });

  it('leaves out what the client did not send', () => {
    expect(
      getConsentRequest({ client_id: 'abc', scope: undefined, state: '' }),
    ).toEqual({ client_id: 'abc', state: '' });
  });
});

describe('OAuthConsentPage', () => {
  it('asks the backend about the request the client sent', async () => {
    mockDetails(details());
    renderPage();

    await screen.findByText('Read your Waldur data');
    expect(oauthConsentRetrieve).toHaveBeenCalledWith({ query: REQUEST });
  });

  it('waits instead of failing while the browser is offline', async () => {
    mockDetails(details());
    onlineManager.setOnline(false);
    try {
      renderPage();

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(
        screen.queryByText('Unable to load the sign-in request.'),
      ).not.toBeInTheDocument();
      expect(oauthConsentRetrieve).not.toHaveBeenCalled();
    } finally {
      onlineManager.setOnline(true);
    }

    expect(
      await screen.findByText('Read your Waldur data'),
    ).toBeInTheDocument();
  });

  it('shows the client, where it sends the browser and who is signed in', async () => {
    mockDetails(details({ client_host: 'claude.ai' }));
    renderPage();

    expect(await screen.findAllByText('Claude')).not.toHaveLength(0);
    expect(screen.getByText('claude.ai')).toBeInTheDocument();
    expect(screen.getByText('127.0.0.1')).toBeInTheDocument();
    expect(screen.getByText('Alice Doe (alice)')).toBeInTheDocument();
    expect(screen.getByText('Read your Waldur data')).toBeInTheDocument();
  });

  it('says when the app registered itself, as it chose its own name', async () => {
    mockDetails(details({ registration_source: 'dcr' }));
    renderPage();

    expect(
      await screen.findByText(
        'This app registered itself. Waldur has not checked its name.',
      ),
    ).toBeInTheDocument();
  });

  it.each(['manual', 'cimd'] as const)(
    'says nothing about the name of a %s client',
    async (source) => {
      mockDetails(details({ registration_source: source }));
      renderPage();

      await screen.findByText('Read your Waldur data');
      expect(screen.queryByText(/registered itself/)).not.toBeInTheDocument();
    },
  );

  it('lets someone else sign out, as the page has no user menu', async () => {
    mockDetails(details());
    renderPage();

    expect(
      await screen.findByRole('link', { name: 'Not you? Sign out' }),
    ).toHaveAttribute('href', 'logout');
  });

  it('still renders when the user is gone after the session ends', async () => {
    vi.mocked(useUser).mockReturnValue(undefined);
    mockDetails(details());
    renderPage();

    expect(
      await screen.findByText('Read your Waldur data'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Signed in as/)).not.toBeInTheDocument();
    expect(screen.queryByText('Not you? Sign out')).not.toBeInTheDocument();
  });

  it('leaves out the website when the client has none', async () => {
    mockDetails(details());
    renderPage();

    await screen.findByText('Read your Waldur data');
    expect(screen.queryByText('Application website')).not.toBeInTheDocument();
  });

  it('shows no elevated-access notice to a regular user', async () => {
    mockDetails(details());
    renderPage();

    await screen.findByText('Read your Waldur data');
    expect(screen.queryByText(/staff access/)).not.toBeInTheDocument();
    expect(screen.queryByText(/support access/)).not.toBeInTheDocument();
    expect(
      screen.queryByText('This app will not work for your account yet'),
    ).not.toBeInTheDocument();
  });

  it('warns when the request asks for staff access', async () => {
    mockDetails(
      details({
        elevated_access: 'staff',
        scopes: [
          { name: 'mcp:read', description: 'Read your Waldur data' },
          { name: 'mcp:staff', description: 'Use your staff access' },
        ],
      }),
    );
    renderPage();

    expect(
      await screen.findByText('This app asks for staff access'),
    ).toBeInTheDocument();
  });

  it('warns when the request asks for support access', async () => {
    mockDetails(
      details({
        elevated_access: 'support',
        scopes: [
          { name: 'mcp:read', description: 'Read your Waldur data' },
          { name: 'mcp:support', description: 'Use your support access' },
        ],
      }),
    );
    renderPage();

    expect(
      await screen.findByText('This app asks for support access'),
    ).toBeInTheDocument();
  });

  it('warns a staff user about staff access whatever order the scopes come in', async () => {
    mockDetails(
      details({
        elevated_access: 'staff',
        scopes: [
          { name: 'mcp:read', description: 'Read your Waldur data' },
          { name: 'mcp:support', description: 'Use your support access' },
          { name: 'mcp:staff', description: 'Use your staff access' },
        ],
      }),
    );
    renderPage();

    expect(
      await screen.findByText('This app asks for staff access'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('This app asks for support access'),
    ).not.toBeInTheDocument();
  });

  it('does not warn a regular user about access their account does not have', async () => {
    mockDetails(
      details({
        scopes: [
          { name: 'mcp:read', description: 'Read your Waldur data' },
          { name: 'mcp:staff', description: 'Use your staff access' },
        ],
      }),
    );
    renderPage();

    await screen.findByText('Read your Waldur data');
    expect(screen.queryByText(/This app asks for/)).not.toBeInTheDocument();
    expect(
      screen.queryByText('This app will not work for your account yet'),
    ).not.toBeInTheDocument();
  });

  it('tells a staff user that support access alone will not work', async () => {
    mockDetails(
      details({
        elevated_access: 'staff',
        scopes: [
          { name: 'mcp:read', description: 'Read your Waldur data' },
          { name: 'mcp:support', description: 'Use your support access' },
        ],
      }),
    );
    renderPage();

    expect(
      await screen.findByText('This app will not work for your account yet'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('This app asks for support access'),
    ).not.toBeInTheDocument();
  });

  it.each(['staff', 'support'] as const)(
    'tells a %s user approving regular access that the app must ask for more',
    async (elevated) => {
      mockDetails(details({ elevated_access: elevated }));
      renderPage();

      expect(
        await screen.findByText('This app will not work for your account yet'),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(`This app asks for ${elevated} access`),
      ).not.toBeInTheDocument();
    },
  );

  it.each([
    ['Allow', true, 'Claude is connected'],
    ['Deny', false, 'Claude was not connected'],
  ])(
    '%s sends the decision and confirms it before returning to the app',
    async (label, allow, result) => {
      mockDetails(details());
      vi.mocked(oauthConsent).mockResolvedValue({
        data: { redirect_url: 'http://127.0.0.1:33418/callback?code=1' },
      } as Awaited<ReturnType<typeof oauthConsent>>);
      renderPage();

      await userEvent.click(await screen.findByRole('button', { name: label }));

      expect(await screen.findByText(result)).toBeInTheDocument();
      expect(oauthConsent).toHaveBeenCalledWith({
        body: { ...REQUEST, allow },
      });
      expect(replace).not.toHaveBeenCalled();

      await userEvent.click(
        screen.getByRole('button', { name: 'Return to Claude' }),
      );
      expect(replace).toHaveBeenCalledWith(
        'http://127.0.0.1:33418/callback?code=1',
      );
    },
  );

  it('returns to the app by itself after a moment', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      mockDetails(details());
      vi.mocked(oauthConsent).mockResolvedValue({
        data: { redirect_url: 'http://127.0.0.1:33418/callback?code=1' },
      } as Awaited<ReturnType<typeof oauthConsent>>);
      renderPage();

      await userEvent.click(
        await screen.findByRole('button', { name: 'Allow' }),
      );
      await screen.findByText('Claude is connected');
      expect(replace).not.toHaveBeenCalled();

      await act(() => vi.advanceTimersByTimeAsync(RETURN_DELAY_MS));
      expect(replace).toHaveBeenCalledWith(
        'http://127.0.0.1:33418/callback?code=1',
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('forgets the request as the page to return to after login', async () => {
    mockDetails(details());
    vi.mocked(oauthConsent).mockResolvedValue({
      data: { redirect_url: 'http://127.0.0.1:33418/callback?code=1' },
    } as Awaited<ReturnType<typeof oauthConsent>>);
    RedirectStorage.set({ toState: 'oauth-consent', toParams: params });
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Allow' }));

    await screen.findByText('Claude is connected');
    expect(RedirectStorage.get()).toBeFalsy();
  });

  it('sends one decision however often the buttons are clicked', async () => {
    mockDetails(details());
    vi.mocked(oauthConsent).mockReturnValue(new Promise(() => undefined));
    renderPage();

    const allow = await screen.findByRole('button', { name: 'Allow' });
    await userEvent.click(allow);
    await userEvent.click(allow);
    await userEvent.click(screen.getByRole('button', { name: 'Deny' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Deny' })).toBeDisabled(),
    );
    expect(oauthConsent).toHaveBeenCalledTimes(1);
    expect(vi.mocked(oauthConsent).mock.calls[0][0].body.allow).toBe(true);
  });

  it('shows an invalid request as an error without the buttons', async () => {
    vi.mocked(oauthConsentRetrieve).mockRejectedValue(
      httpError(400, {
        error: 'invalid_request',
        error_description: 'Invalid code challenge method.',
      }),
    );
    renderPage();

    expect(
      await screen.findByText('This sign-in request cannot be used'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Invalid code challenge method\./),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Allow' }),
    ).not.toBeInTheDocument();
  });

  it.each([
    ['invalid_scope', 'This app asks for access Waldur does not offer'],
    ['invalid_target', 'This app is set up for another server'],
    ['unauthorized_client', 'This app cannot connect to Waldur this way'],
    ['unsupported_response_type', 'This app cannot connect to Waldur this way'],
    ['server_error', 'Waldur could not complete this request'],
  ])('explains %s in its own words', async (error, title) => {
    vi.mocked(oauthConsentRetrieve).mockRejectedValue(
      httpError(400, { error, error_description: '' }),
    );
    renderPage();

    expect(await screen.findByText(title)).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(error))).not.toBeInTheDocument();
  });

  it('keeps the backend’s description under a specific title', async () => {
    vi.mocked(oauthConsentRetrieve).mockRejectedValue(
      httpError(400, {
        error: 'invalid_target',
        error_description: 'The requested resource is not served here.',
      }),
    );
    renderPage();

    expect(
      await screen.findByText(/The requested resource is not served here\./),
    ).toBeInTheDocument();
  });

  it('names an unknown error when the backend gives no description', async () => {
    vi.mocked(oauthConsentRetrieve).mockRejectedValue(
      httpError(400, { error: 'invalid_grant', error_description: '' }),
    );
    renderPage();

    expect(
      await screen.findByText('This sign-in request cannot be used'),
    ).toBeInTheDocument();
    expect(screen.getByText(/invalid_grant/)).toBeInTheDocument();
  });

  it('says so when apps may not connect to the portal', async () => {
    vi.mocked(oauthConsentRetrieve).mockRejectedValue(httpError(404));
    // The app's client, whose error handler sends other 404s to the 404 page.
    renderWithProviders(<OAuthConsentPage />, { queryClient });

    expect(
      await screen.findByText('Apps cannot connect to this portal'),
    ).toBeInTheDocument();
    expect(router.stateService.go).not.toHaveBeenCalled();
    queryClient.clear();
  });

  it('explains a 403 as needing the user’s own sign-in', async () => {
    vi.mocked(oauthConsentRetrieve).mockRejectedValue(
      httpError(403, {
        detail: 'OAuth clients can only be approved from your own sign-in.',
      }),
    );
    renderPage();

    expect(
      await screen.findByText('Approve apps from your own sign-in'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Allow' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Stop impersonating' }),
    ).not.toBeInTheDocument();
  });

  it('lets staff stop impersonating and answer as themselves', async () => {
    ImpersonationStorage.set('impersonated-uuid');
    vi.spyOn(UsersService, 'refreshCurrentUser').mockResolvedValue({} as User);
    vi.mocked(oauthConsentRetrieve)
      .mockRejectedValueOnce(httpError(403))
      .mockResolvedValue({ data: details() } as Awaited<
        ReturnType<typeof oauthConsentRetrieve>
      >);
    renderPage();

    expect(
      await screen.findByText('Stop impersonating to approve apps'),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Stop impersonating' }),
    );

    expect(
      await screen.findByRole('button', { name: 'Allow' }),
    ).toBeInTheDocument();
    expect(ImpersonationStorage.get()).toBeFalsy();
    expect(UsersService.refreshCurrentUser).toHaveBeenCalled();
  });

  it('still asks to stop impersonating when stopping fails', async () => {
    ImpersonationStorage.set('impersonated-uuid');
    vi.spyOn(UsersService, 'refreshCurrentUser').mockRejectedValue(
      httpError(500),
    );
    vi.mocked(oauthConsentRetrieve).mockRejectedValue(httpError(403));
    renderPage();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Stop impersonating' }),
    );

    await waitFor(() => expect(showErrorResponse).toHaveBeenCalled());
    expect(
      await screen.findByText('Stop impersonating to approve apps'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Approve apps from your own sign-in'),
    ).not.toBeInTheDocument();
    expect(ImpersonationStorage.get()).toBe('impersonated-uuid');
  });

  it('replaces the form when the decision is refused', async () => {
    mockDetails(details());
    vi.mocked(oauthConsent).mockRejectedValue(
      httpError(400, {
        error: 'invalid_request',
        error_description: 'The request has expired.',
      }),
    );
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Allow' }));

    expect(
      await screen.findByText('This sign-in request cannot be used'),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    expect(showErrorResponse).not.toHaveBeenCalled();
  });

  it('lets the user try again after a failure that is not a refusal', async () => {
    mockDetails(details());
    vi.mocked(oauthConsent).mockRejectedValueOnce(httpError(500));
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Allow' }));

    await waitFor(() => expect(showErrorResponse).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Allow' })).toBeEnabled(),
    );
  });
});
