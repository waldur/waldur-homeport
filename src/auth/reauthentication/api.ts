import { client } from 'waldur-js-client/client.gen';

/**
 * POST /api/reauthentication/password/ — not yet in published
 * waldur-js-client exports. Resolves with a single-use grant for `action`.
 * A wrong password is a 400 on `password`, a locked-out account a 429.
 */
export const reauthenticateWithPassword = async (
  action: string,
  password: string,
): Promise<string> => {
  const response = await client.post({
    url: '/api/reauthentication/password/',
    body: { action, password },
    headers: { 'Content-Type': 'application/json' },
  });
  return (response.data as { grant: string }).grant;
};

/**
 * What a guarded request fails with when the user does not confirm it is
 * them, or the session ends while they are being asked. An Error, so the API
 * client's error interceptor passes it through as it is, and its message is
 * what the app's error formatter shows.
 */
export class ReauthenticationCancelled extends Error {
  readonly code = 'reauthentication_cancelled';

  constructor(message: string) {
    super(message);
    this.name = 'ReauthenticationCancelled';
  }
}
