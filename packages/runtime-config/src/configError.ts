/**
 * Classifies a failed config-fetch error into a user-facing message,
 * preserving the underlying error via `cause` so it remains visible in
 * devtools and Sentry breadcrumbs alongside the friendly message.
 *
 * Every branch names the endpoint. Whoever reads this message is usually an
 * operator looking at a deployment that has never worked, and the two facts
 * that tell them where to look are the URL that was called and what came back;
 * a message carrying neither -- which is what a failed bootstrap used to
 * produce -- is not actionable.
 *
 * The shapes come from the SDK client, normalised by the error interceptor in
 * packages/auth-core: a real `Error` (usually `TypeError`) when the fetch never
 * produced a response, otherwise the response body with `status`/`statusText`
 * lifted onto it.
 */
export function describeConfigError(error: any, apiEndpoint: string): Error {
  const prefix = `Unable to fetch server configuration from ${apiEndpoint}.`;
  let message: string;
  if (error instanceof TypeError) {
    // The request never completed: DNS, connection refused, a CORS block, or
    // -- the case that has actually bitten operators -- an https page blocked
    // from calling an http API. The browser deliberately withholds the reason,
    // so point at the check that distinguishes them.
    message = `${prefix} The request did not complete. Please check that you can open ${apiEndpoint} directly in this browser, that it is served over the same scheme as this page, and contact support if the error continues.`;
  } else if (error instanceof SyntaxError) {
    message = `${prefix} Server does not return valid JSON.`;
  } else {
    const status = error?.status ?? error?.response?.status;
    const statusText = error?.statusText ?? error?.response?.statusText;
    if (status) {
      message = statusText
        ? `${prefix} Server responded ${status} ${statusText}.`
        : `${prefix} Server responded ${status}.`;
    } else {
      message = prefix;
    }
  }
  const wrapped = new Error(message);
  (wrapped as Error & { cause?: unknown }).cause = error;
  return wrapped;
}
