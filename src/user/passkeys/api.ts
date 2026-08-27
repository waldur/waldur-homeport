import {
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
import {
  passkeysMfaBegin,
  passkeysMfaFinish,
  passkeysRegistrationBegin,
  passkeysRegistrationFinish,
  passkeysSigninBegin,
  passkeysSigninFinish,
} from 'waldur-js-client';

/**
 * Ceremony helpers.
 *
 * Each ceremony is split into a `prepare` and a `complete` half, and callers
 * must run `prepare` *before* the click that starts the ceremony.
 *
 * That split is not cosmetic. `navigator.credentials.create()` and `.get()`
 * are gated on transient user activation, and awaiting a network request
 * consumes it: fetching the challenge inside the click handler means the
 * WebAuthn call runs with stale activation and the browser rejects it with
 * NotAllowedError — Safari strictly, Chrome intermittently. The symptom is a
 * button that does nothing at all, because NotAllowedError is also what a
 * genuine user cancellation raises.
 *
 * So: fetch the challenge up front, and let the click do nothing but the
 * WebAuthn call.
 */

export interface PreparedCeremony {
  ceremony: string;
  options: any;
}

export const prepareRegistration = async (): Promise<PreparedCeremony> => {
  const begin = await passkeysRegistrationBegin();
  return { ceremony: begin.data.ceremony, options: begin.data.options };
};

/** Must be called directly from a click handler, with no await before it. */
export const completeRegistration = async (
  prepared: PreparedCeremony,
  name: string,
) => {
  const credential = await startRegistration({
    optionsJSON: prepared.options,
  });
  const response = await passkeysRegistrationFinish({
    body: { ceremony: prepared.ceremony, name, credential } as any,
  });
  return response.data;
};

export const prepareSignin = async (): Promise<PreparedCeremony> => {
  const begin = await passkeysSigninBegin();
  return { ceremony: begin.data.ceremony, options: begin.data.options };
};

/** Must be called directly from a click handler, with no await before it. */
export const completeSignin = async (prepared: PreparedCeremony) => {
  const credential = await startAuthentication({
    optionsJSON: prepared.options,
  });
  const response = await passkeysSigninFinish({
    body: { ceremony: prepared.ceremony, credential } as any,
  });
  return response.data.token;
};

/**
 * `ceremony` is the pending handle returned by the login endpoint. It is not
 * a token and cannot be used as one.
 */
export const prepareMfa = async (
  ceremony: string,
): Promise<PreparedCeremony> => {
  const begin = await passkeysMfaBegin({ body: { ceremony } as any });
  return { ceremony, options: begin.data.options };
};

/** Must be called directly from a click handler, with no await before it. */
export const completeMfa = async (prepared: PreparedCeremony) => {
  const credential = await startAuthentication({
    optionsJSON: prepared.options,
  });
  const response = await passkeysMfaFinish({
    body: { ceremony: prepared.ceremony, credential } as any,
  });
  return response.data.token;
};

/** Whether this browser can do WebAuthn at all. */
export const isPasskeySupported = () =>
  typeof window !== 'undefined' &&
  typeof window.PublicKeyCredential !== 'undefined';

/**
 * Whether this device has a built-in authenticator the site can use —
 * Touch ID, Windows Hello, Android screen lock.
 *
 * Worth surfacing: when it is false the browser's enrolment dialog offers
 * only a phone via QR or a security key, and a user staring at that has no
 * way to tell whether the site is broken or their device simply has nothing
 * to offer.
 */
export const isPlatformAuthenticatorAvailable = async (): Promise<boolean> => {
  if (!isPasskeySupported()) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
};

/**
 * Turn a WebAuthn DOMException into something a user can act on.
 *
 * NotAllowedError is deliberately *not* treated as a silent cancellation. It
 * is what the browser raises both when the user dismisses the prompt and when
 * the call was refused outright (stale activation, wrong RP ID, an origin the
 * server does not allow), and swallowing it turns a real misconfiguration
 * into a button that does nothing.
 */
export const describePasskeyError = (error: any): string | null => {
  const name = error?.name;
  if (name === 'AbortError') {
    // The page navigated away or an explicit AbortController fired: nothing
    // the user did, and nothing to report.
    return null;
  }
  if (name === 'NotAllowedError') {
    return 'Passkey prompt was dismissed or refused by the browser. If you did not dismiss it, check that the site is served over HTTPS or localhost.';
  }
  if (name === 'InvalidStateError') {
    return 'This device already has a passkey registered for this account.';
  }
  if (name === 'NotSupportedError') {
    return 'This device does not offer an authenticator this site can use.';
  }
  if (name === 'SecurityError') {
    return 'The site origin is not allowed to use passkeys. This usually means the configured passkey domain does not match the address in the address bar.';
  }
  return null;
};
