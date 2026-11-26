import Qs from 'qs';
import { FunctionComponent, ReactNode, useMemo } from 'react';

import { ENV } from '@/core/config';
import { Link } from '@/core/Link';
import { getQueryString } from '@/core/utils';
import { translate } from '@/i18n';

const URL_PATTERN = /https?:\/\/[^\s<>"'`]+/gi;
const BIDI_CONTROLS = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;
const TRAILING = new Set(['.', ',', ';', ':', '!', '?', '…', '。', '）']);
const CLOSERS: Record<string, string> = { ')': '(', ']': '[' };

const count = (text: string, char: string) => text.split(char).length - 1;

/** Drops sentence punctuation after a URL, keeping balanced closing brackets. */
const trimTrailing = (candidate: string): string => {
  let end = candidate.length;
  while (end > 0) {
    const char = candidate[end - 1];
    const opener = CLOSERS[char];
    const body = candidate.slice(0, end);
    if (
      TRAILING.has(char) ||
      (opener && count(body, char) > count(body, opener))
    ) {
      end -= 1;
    } else {
      break;
    }
  }
  return candidate.slice(0, end);
};

/** The URL as it will be linked, or null when it should stay text. */
const toLink = (candidate: string): string | null => {
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }
  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    !parsed.hostname ||
    parsed.username ||
    parsed.password
  ) {
    return null;
  }
  // Shows the host in punycode, so a look-alike domain reads as what it is.
  return parsed.href;
};

/** Without bidi controls or long runs of blank lines. */
export const normalizeMessage = (message: string): string =>
  message
    .replace(BIDI_CONTROLS, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/**
 * The message as text, with bare http(s) URLs turned into links whose visible
 * text is the URL itself. The query string is attacker-controllable, so no
 * HTML or markdown in it is interpreted: a crafted link could otherwise carry
 * its own label or utility classes and cover the page. URLs with credentials
 * stay text, since `https://trusted@evil.example` reads as the wrong host.
 */
export const linkifyMessage = (message: string): ReactNode[] => {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of message.matchAll(URL_PATTERN)) {
    const start = match.index;
    const candidate = trimTrailing(match[0]);
    const href = toLink(candidate);
    if (!href) {
      continue;
    }
    if (start > last) {
      parts.push(message.slice(last, start));
    }
    parts.push(
      <a key={start} href={href} target="_blank" rel="noopener noreferrer">
        {href}
      </a>,
    );
    last = start + candidate.length;
  }
  if (last < message.length) {
    parts.push(message.slice(last));
  }
  return parts;
};

/**
 * The backend sends a failure code, never text: a message read from the URL
 * would let anyone show their own words, and a link, on the portal's domain.
 * Only the two OIDC block messages are operator-written, and they come from
 * the public configuration rather than the URL.
 */
export const getLoginFailureMessage = (code: unknown): string => {
  const core = ENV.plugins?.WALDUR_CORE;
  switch (code) {
    case 'saml2_denied':
      return translate(
        'Authentication request has been denied by identity provider. Please check your credentials.',
      );
    case 'saml2_invalid_response':
    case 'saml2_empty_response':
    case 'saml2_no_assertion':
      return translate(
        "The identity provider's response could not be processed. Please try again or contact support.",
      );
    case 'saml2_rejected':
    case 'saml2_failed':
      return translate('SAML2 authentication failed.');
    case 'oidc_invalid_state':
      return translate(
        'This sign-in has expired or was already used. Please sign in again.',
      );
    case 'oidc_blocked':
      return (
        core?.OIDC_BLOCKED_LOGIN_RESPONSE_MESSAGE ||
        translate('Access to this deployment is restricted.')
      );
    case 'oidc_uninvited':
      return (
        core?.OIDC_BLOCK_CREATION_OF_UNINVITED_USERS_RESPONSE_MESSAGE ||
        translate('Account creation is blocked for uninvited users.')
      );
    case 'oidc_email_missing':
      return translate(
        'User email is not provided. Account creation is blocked.',
      );
    case 'oidc_email_not_trusted':
      return translate(
        'This sign-in cannot be completed for this email address. Please contact support.',
      );
    default:
      return translate('Sign-in could not be completed. Please try again.');
  }
};

export const AuthLoginFailed: FunctionComponent = () => {
  const code = Qs.parse(getQueryString())?.code;
  // Bare URLs in the configured OIDC messages are linked, as their settings'
  // help text promises; the built-in messages contain none.
  const content = useMemo(
    () => linkifyMessage(normalizeMessage(getLoginFailureMessage(code))),
    [code],
  );

  return (
    <div className="text-center">
      <h3>{translate('Login failed')}</h3>
      <p
        className="mt-2.5 rich-text whitespace-pre-line"
        data-testid="login-failed-message"
      >
        {content}
      </p>
      <p className="mt-2.5">
        <Link state="login"> &lt; {translate('Back to login')} </Link>
      </p>
    </div>
  );
};
