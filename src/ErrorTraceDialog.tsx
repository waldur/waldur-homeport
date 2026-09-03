import { FallbackRender } from '@sentry/react';

import { translate } from '@/i18n';

import { ModalDialog } from './modal/ModalDialog';

// A bootstrap failure is wrapped around whatever the API client threw, and the
// cause is where the actionable detail lives -- the status and the URL for an
// HTTP error, the browser's own message for a blocked request. It is not always
// an Error, so it has no stack of its own; serialise it rather than showing the
// wrapper's stack alone, which only ever points at the bundle.
const describeError = (error: Error) => {
  const cause = (error as Error & { cause?: unknown }).cause;
  if (cause === undefined) {
    return error.stack ?? error.message;
  }
  const causeText =
    cause instanceof Error
      ? (cause.stack ?? `${cause.name}: ${cause.message}`)
      : safeStringify(cause);
  return `${error.stack ?? error.message}\n\nCaused by: ${causeText}`;
};

// The cause can carry a Response, which JSON.stringify chokes on, and can be
// circular. Never let formatting an error throw a second error.
const safeStringify = (value: unknown) => {
  try {
    return JSON.stringify(value, replaceUnserialisable, 2) ?? String(value);
  } catch {
    return String(value);
  }
};

const replaceUnserialisable = (_key: string, value: unknown) =>
  value instanceof Response
    ? { status: value.status, statusText: value.statusText, url: value.url }
    : value;

export const ErrorTraceDialog: FallbackRender = (props) => {
  return (
    <ModalDialog title={translate('Error trace')}>
      <div
        className="text-muted mh-300px scroll-y"
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {props.componentStack || describeError(props.error as Error)}
      </div>
    </ModalDialog>
  );
};
