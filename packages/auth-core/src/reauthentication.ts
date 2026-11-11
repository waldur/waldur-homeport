import { getAuthHeader } from './authHeader';
import { getAuthCoreConfig, ReauthenticationChallenge } from './config';

// Some changes (the API token lifetime, the email address, a new passkey, a
// personal access token) need fresh proof that the person at the keyboard can
// sign in, not just the API token: the token is the same for every session,
// so a copy of it proves nothing. The API refuses such a change with a 401
// step-up challenge (RFC 9470), the user confirms it is them, and the request
// is sent again with the single-use grant that earned.
//
// The challenge is a 401, as an expired session is, so the status alone must
// never decide: the body's `code` does. Signing the user out on it would end
// a perfectly good session in the middle of the change they were making.

/** The request header a guarded change carries its grant in. */
const REAUTHENTICATION_GRANT_HEADER = 'X-Reauthentication-Grant';

const CHALLENGE_CODE = 'reauthentication_required';

// One read per response: both the retry and the sign-out guard ask.
const challenges = new WeakMap<
  Response,
  Promise<ReauthenticationChallenge | null>
>();

const parseChallenge = async (
  response: Response,
): Promise<ReauthenticationChallenge | null> => {
  try {
    const body = await response.clone().json();
    if (body?.code !== CHALLENGE_CODE) {
      return null;
    }
    return {
      action: String(body.action ?? ''),
      methods: Array.isArray(body.methods) ? body.methods.map(String) : [],
      detail: typeof body.detail === 'string' ? body.detail : undefined,
    };
  } catch {
    // Not JSON: an expired session, a proxy's page, anything but a challenge.
    return null;
  }
};

/**
 * The step-up challenge a response carries, or null. Read from a clone, so
 * the caller still gets the body whole.
 */
export const readReauthenticationChallenge = (
  response: Response,
): Promise<ReauthenticationChallenge | null> => {
  if (response?.status !== 401 || typeof response.clone !== 'function') {
    return Promise.resolve(null);
  }
  let challenge = challenges.get(response);
  if (!challenge) {
    challenge = parseChallenge(response);
    challenges.set(response, challenge);
  }
  return challenge;
};

// What the generated client hands a response interceptor as its third
// argument: the resolved request options, with the body it serialized.
interface SentRequestOptions {
  body?: unknown;
  bodySerializer?: unknown;
  serializedBody?: unknown;
  fetch?: (request: Request) => Promise<Response>;
}

// The body the request was sent with. fetch() has already read the request's
// own stream, so it is taken again from what the client serialized, as the
// client does itself (getValidRequestBody in the generated core).
const getSentBody = (opts: SentRequestOptions): BodyInit | null | undefined => {
  if (opts.body === undefined) {
    return undefined;
  }
  if (opts.bodySerializer) {
    if ('serializedBody' in opts) {
      return opts.serializedBody !== undefined && opts.serializedBody !== ''
        ? (opts.serializedBody as BodyInit)
        : null;
    }
    return opts.body !== '' ? (opts.body as BodyInit) : null;
  }
  return opts.body as BodyInit;
};

const withGrant = (
  request: Request,
  opts: SentRequestOptions,
  grant: string,
): Request => {
  const headers = new Headers(request.headers);
  headers.set(REAUTHENTICATION_GRANT_HEADER, grant);
  const body = getSentBody(opts);
  // A multipart body is sent with a new boundary, which the old header
  // would contradict: let fetch write the header for it.
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    headers.delete('Content-Type');
  }
  return new Request(request.url, {
    method: request.method,
    headers,
    body,
    credentials: request.credentials,
    redirect: request.redirect,
    referrerPolicy: request.referrerPolicy,
    signal: request.signal,
  });
};

// The endpoints that issue grants. A challenge from one of them would wait
// behind the very dialog that is asking for the grant.
const GRANT_ENDPOINTS_PATH = 'api/reauthentication/';

// Whether a challenge on this request is one to answer: the request went to
// the configured API, and not to an endpoint that issues grants. The grant is
// sent to nothing else.
const isGuardedApiRequest = (url: string) => {
  let api: URL;
  let target: URL;
  try {
    // Against the origin, not the page: an empty or relative endpoint is
    // relative to the site root, whatever page the request came from.
    api = new URL(
      getAuthCoreConfig().getApiEndpoint(),
      globalThis.location?.origin,
    );
    target = new URL(url, api);
  } catch {
    return false;
  }
  if (
    target.origin !== api.origin ||
    !target.pathname.startsWith(api.pathname)
  ) {
    return false;
  }
  const path = target.pathname.slice(api.pathname.length).replace(/^\//, '');
  return !path.startsWith(GRANT_ENDPOINTS_PATH);
};

/**
 * Response interceptor: on a step-up challenge, asks the host for a grant
 * (onReauthenticationRequired, which asks the user) and sends the request
 * once more with it. The caller gets the retry's response, as if the first
 * attempt had not happened. If the user cancels, the host's rejection
 * becomes the request's error; if the retry cannot be sent (the network, or
 * an API on another origin that does not allow the grant header), fetch's own
 * error does.
 *
 * Only once: the retry is sent with fetch directly, not through the client,
 * and a request that already carried a grant is not asked about again.
 */
export const handleReauthenticationChallenge = async (
  response: Response,
  request: Request,
  opts: SentRequestOptions = {},
): Promise<Response> => {
  const { onReauthenticationRequired } = getAuthCoreConfig();
  if (
    !onReauthenticationRequired ||
    !request ||
    request.headers.has(REAUTHENTICATION_GRANT_HEADER) ||
    !isGuardedApiRequest(request.url)
  ) {
    return response;
  }
  const challenge = await readReauthenticationChallenge(response);
  // A request sent for a session that has since ended (signed out, or
  // another account signed in) is not this user's to confirm: its challenge
  // would otherwise open "Confirm it's you" over the login page, or for the
  // wrong account.
  if (
    !challenge ||
    (request.headers.get('Authorization') ?? undefined) !== getAuthHeader()
  ) {
    return response;
  }
  const grant = await onReauthenticationRequired(challenge);
  // Called unbound: fetch refuses to run with the options object as `this`.
  const send = opts.fetch ?? globalThis.fetch;
  return send(withGrant(request, opts, grant));
};
