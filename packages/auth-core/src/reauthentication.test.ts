import { beforeEach, describe, expect, it, vi } from 'vitest';
import { client } from 'waldur-js-client/client.gen';

import { handleUnauthorizedResponse, resetAuthSessionTracking } from './client';
import { AuthCoreConfig, configureAuthCore } from './config';
import {
  handleReauthenticationChallenge,
  readReauthenticationChallenge,
} from './reauthentication';

const makeStorage = (initial: string | null = null) => {
  let value = initial;
  return {
    get: () => value,
    set: (v: string) => {
      value = v;
    },
    remove: () => {
      value = null;
    },
  };
};

const API = 'http://localhost:8080/';
const USER_URL = `${API}api/users/u1/`;

const onSessionExpired = vi.fn();
const onReauthenticationRequired = vi.fn();

const configure = (overrides: Partial<AuthCoreConfig> = {}) =>
  configureAuthCore({
    storage: {
      token: makeStorage('local-key'),
      method: makeStorage('local'),
      impersonation: makeStorage(),
      language: makeStorage(),
    },
    getApiEndpoint: () => API,
    isConfigLoaded: () => true,
    isOidcAccessTokenEnabled: () => false,
    onSessionExpired,
    onReauthenticationRequired,
    ...overrides,
  });

const CHALLENGE = {
  detail: 'Confirm your identity to make this change.',
  code: 'reauthentication_required',
  action: 'token_lifetime',
  methods: ['password', 'passkey'],
};

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const challengeResponse = (body: object = CHALLENGE) => jsonResponse(401, body);

// The request as the generated client hands it to a response interceptor:
// already sent, so its body stream is used up, with the serialized body in
// the options beside it.
const sentPatch = (headers: Record<string, string> = {}) => {
  const serializedBody = JSON.stringify({ token_lifetime: 3600 });
  const request = new Request(USER_URL, {
    method: 'PATCH',
    headers: {
      Authorization: 'Token local-key',
      'Content-Type': 'application/json',
      ...headers,
    },
    body: serializedBody,
  });
  return {
    request,
    opts: {
      body: { token_lifetime: 3600 },
      bodySerializer: JSON.stringify,
      serializedBody,
    },
  };
};

beforeEach(() => {
  onSessionExpired.mockReset();
  onReauthenticationRequired.mockReset();
  resetAuthSessionTracking();
  configure();
});

describe('readReauthenticationChallenge', () => {
  it('reads the challenge from a 401 whose body says so', async () => {
    const response = challengeResponse();
    expect(await readReauthenticationChallenge(response)).toEqual({
      action: 'token_lifetime',
      methods: ['password', 'passkey'],
      detail: 'Confirm your identity to make this change.',
    });
    // From a clone: the caller still reads the body.
    expect(await response.json()).toEqual(CHALLENGE);
  });

  it('does not take any other 401 for one', async () => {
    expect(
      await readReauthenticationChallenge(
        jsonResponse(401, { detail: 'Invalid token.' }),
      ),
    ).toBeNull();
    expect(
      await readReauthenticationChallenge(
        new Response('<html>Unauthorized</html>', { status: 401 }),
      ),
    ).toBeNull();
  });

  it('leaves the body of other statuses unread', async () => {
    const response = jsonResponse(400, CHALLENGE);
    expect(await readReauthenticationChallenge(response)).toBeNull();
    expect(response.bodyUsed).toBe(false);
  });
});

describe('handleReauthenticationChallenge', () => {
  it('sends the request again with the grant the user obtained', async () => {
    onReauthenticationRequired.mockResolvedValue('the-grant');
    const retried = jsonResponse(200, { uuid: 'u1' });
    const fetch = vi.fn().mockResolvedValue(retried);
    const { request, opts } = sentPatch();

    const result = await handleReauthenticationChallenge(
      challengeResponse(),
      request,
      { ...opts, fetch },
    );

    expect(onReauthenticationRequired).toHaveBeenCalledWith({
      action: 'token_lifetime',
      methods: ['password', 'passkey'],
      detail: 'Confirm your identity to make this change.',
    });
    expect(result).toBe(retried);
    expect(fetch).toHaveBeenCalledTimes(1);
    const retry: Request = fetch.mock.calls[0][0];
    expect(retry.url).toBe(USER_URL);
    expect(retry.method).toBe('PATCH');
    expect(retry.headers.get('X-Reauthentication-Grant')).toBe('the-grant');
    expect(retry.headers.get('Authorization')).toBe('Token local-key');
    expect(await retry.json()).toEqual({ token_lifetime: 3600 });
  });

  it('fails the request with the host’s reason when the user cancels', async () => {
    const reason = { code: 'reauthentication_cancelled', message: 'No.' };
    onReauthenticationRequired.mockRejectedValue(reason);
    const fetch = vi.fn();
    const { request, opts } = sentPatch();

    await expect(
      handleReauthenticationChallenge(challengeResponse(), request, {
        ...opts,
        fetch,
      }),
    ).rejects.toBe(reason);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not ask again for a request that already carried a grant', async () => {
    const fetch = vi.fn();
    const { request, opts } = sentPatch({
      'X-Reauthentication-Grant': 'spent',
    });
    const response = challengeResponse();

    const result = await handleReauthenticationChallenge(response, request, {
      ...opts,
      fetch,
    });

    expect(result).toBe(response);
    expect(onReauthenticationRequired).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('passes other responses through untouched', async () => {
    const { request, opts } = sentPatch();
    const expired = jsonResponse(401, { detail: 'Invalid token.' });
    const ok = jsonResponse(200, {});

    expect(await handleReauthenticationChallenge(expired, request, opts)).toBe(
      expired,
    );
    expect(await handleReauthenticationChallenge(ok, request, opts)).toBe(ok);
    expect(onReauthenticationRequired).not.toHaveBeenCalled();
    expect(ok.bodyUsed).toBe(false);
  });

  it('hands the challenge to the caller when the host cannot ask', async () => {
    configure({ onReauthenticationRequired: undefined });
    const { request, opts } = sentPatch();
    const response = challengeResponse();

    expect(await handleReauthenticationChallenge(response, request, opts)).toBe(
      response,
    );
  });

  it('lets fetch write the header of a multipart body', async () => {
    onReauthenticationRequired.mockResolvedValue('the-grant');
    const fetch = vi.fn().mockResolvedValue(jsonResponse(200, {}));
    const form = new FormData();
    form.append('email', 'new@example.com');
    const request = new Request(USER_URL, {
      method: 'PATCH',
      headers: {
        Authorization: 'Token local-key',
        'Content-Type': 'multipart/form-data; boundary=old',
      },
      body: form,
    });

    await handleReauthenticationChallenge(challengeResponse(), request, {
      body: { email: 'new@example.com' },
      bodySerializer: () => form,
      serializedBody: form,
      fetch,
    });

    const retry: Request = fetch.mock.calls[0][0];
    expect(retry.headers.get('Content-Type')).not.toContain('boundary=old');
    expect((await retry.formData()).get('email')).toBe('new@example.com');
  });
});

describe('handleReauthenticationChallenge — what it answers', () => {
  it('leaves a challenge from the endpoints that issue grants alone', async () => {
    const request = new Request(`${API}api/reauthentication/password/`, {
      method: 'POST',
    });
    const response = challengeResponse();

    expect(await handleReauthenticationChallenge(response, request, {})).toBe(
      response,
    );
    expect(onReauthenticationRequired).not.toHaveBeenCalled();
  });

  it('leaves a challenge from anything but the configured API alone', async () => {
    const request = new Request('https://elsewhere.example.com/api/users/u1/', {
      method: 'PATCH',
    });
    const response = challengeResponse();

    expect(await handleReauthenticationChallenge(response, request, {})).toBe(
      response,
    );
    expect(onReauthenticationRequired).not.toHaveBeenCalled();
  });

  it('leaves a challenge alone once the session that sent it has ended', async () => {
    // Sent as `Token local-key`; meanwhile the user signed out, or another
    // account signed in. Asking now would prompt over the login page, or
    // the wrong person.
    const { request, opts } = sentPatch();
    for (const token of [null, 'next-account-key']) {
      configure({
        storage: {
          token: makeStorage(token),
          method: makeStorage('local'),
          impersonation: makeStorage(),
          language: makeStorage(),
        },
      });
      const response = challengeResponse();

      expect(
        await handleReauthenticationChallenge(response, request, opts),
      ).toBe(response);
    }
    expect(onReauthenticationRequired).not.toHaveBeenCalled();
  });

  it('answers on any page when the API URL is empty', async () => {
    // An empty endpoint is the site root, not the page the user is on.
    configure({ getApiEndpoint: () => '' });
    // The location mock (test/setupTests) lets assign() move the page.
    window.location.assign('/profile/api-key/');
    expect(location.pathname).toBe('/profile/api-key/');
    try {
      onReauthenticationRequired.mockResolvedValue('the-grant');
      const fetch = vi.fn().mockResolvedValue(jsonResponse(200, {}));
      const request = new Request(`${location.origin}/api/users/u1/`, {
        method: 'PATCH',
        headers: { Authorization: 'Token local-key' },
        body: '{}',
      });

      await handleReauthenticationChallenge(challengeResponse(), request, {
        body: {},
        bodySerializer: JSON.stringify,
        serializedBody: '{}',
        fetch,
      });

      expect(onReauthenticationRequired).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledTimes(1);
    } finally {
      window.location.assign('/');
    }
  });

  it('fails with fetch’s own error when the retry cannot be sent', async () => {
    onReauthenticationRequired.mockResolvedValue('the-grant');
    const blocked = new TypeError('Failed to fetch');
    const fetch = vi.fn().mockRejectedValue(blocked);
    const { request, opts } = sentPatch();

    await expect(
      handleReauthenticationChallenge(challengeResponse(), request, {
        ...opts,
        fetch,
      }),
    ).rejects.toBe(blocked);
  });
});

describe('the API client and the step-up challenge', () => {
  // Through the generated client and every interceptor client.ts registers:
  // the error a caller gets is the one that happened, not the first 401.
  const patch = (fetch) =>
    client.patch({
      baseUrl: 'http://localhost:8080',
      url: '/api/users/u1/',
      body: { token_lifetime: 3600 },
      headers: { 'Content-Type': 'application/json' },
      throwOnError: true,
      fetch,
    });

  it('hands the caller the retry’s answer', async () => {
    onReauthenticationRequired.mockResolvedValue('the-grant');
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(challengeResponse())
      .mockResolvedValueOnce(jsonResponse(200, { uuid: 'u1' }));

    const { data } = await patch(fetch);

    expect(data).toEqual({ uuid: 'u1' });
    expect(fetch.mock.calls[1][0].headers.get('X-Reauthentication-Grant')).toBe(
      'the-grant',
    );
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('does not pass a failed retry off as the 401', async () => {
    onReauthenticationRequired.mockResolvedValue('the-grant');
    const blocked = new TypeError('Failed to fetch');
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(challengeResponse())
      .mockRejectedValueOnce(blocked);

    const error = await patch(fetch).catch((e) => e);

    expect(error).toBe(blocked);
    expect(error.status).toBeUndefined();
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('fails with the host’s reason, untouched, when the user cancels', async () => {
    const reason = new Error('Nothing was changed.');
    onReauthenticationRequired.mockRejectedValue(reason);
    const fetch = vi.fn().mockResolvedValueOnce(challengeResponse());

    const error = await patch(fetch).catch((e) => e);

    expect(error).toBe(reason);
    expect(error.status).toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(onSessionExpired).not.toHaveBeenCalled();
  });
});

describe('handleUnauthorizedResponse and the step-up challenge', () => {
  it('does not sign the user out on a challenge', async () => {
    await handleUnauthorizedResponse(challengeResponse());
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('still signs the user out when the session has expired', async () => {
    await handleUnauthorizedResponse(
      jsonResponse(401, { detail: 'Invalid token.' }),
    );
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });
});
