import { translate } from 'waldur-i18n-runtime';

// waldur-auth-core's error interceptor rejects with the response body's keys
// spread onto a plain object, next to these. They are not the API's message.
const ENVELOPE_KEYS = ['response', 'status', 'statusText', 'url', 'body'];
// Keys whose text reads on its own, without "key:" in front.
const MESSAGE_KEYS = ['detail', 'non_field_errors', 'message'];

const flatten = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'object') return String(value);
  if (Array.isArray(value)) return value.map(flatten).filter(Boolean).join(' ');
  return Object.entries(value)
    .map(([key, item]) => {
      const text = flatten(item);
      if (!text) return '';
      return MESSAGE_KEYS.includes(key) ? text : `${key}: ${text}`;
    })
    .filter(Boolean)
    .join(' ');
};

/**
 * A micro-app's text for a failed request, until it registers its own
 * (setErrorResponseFormatter): the API's message, such as DRF's `detail` or a
 * validation error per field. Without it a toast read "[object Object]".
 */
export const formatApiError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (!error || typeof error !== 'object') {
    return error ? String(error) : translate('The request failed.');
  }
  const fields = error as Record<string, unknown>;
  if (fields.status === -1) {
    return translate(
      'Could not reach the server. Check your connection and try again.',
    );
  }
  const body =
    fields.data && typeof fields.data === 'object'
      ? fields.data
      : Object.fromEntries(
          Object.entries(fields).filter(
            ([key]) => !ENVELOPE_KEYS.includes(key),
          ),
        );
  const text = flatten(body);
  if (text) return text;
  return typeof fields.status === 'number' && fields.statusText
    ? `${fields.status} ${String(fields.statusText)}`
    : translate('The request failed.');
};
