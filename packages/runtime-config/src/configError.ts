/**
 * Classifies a failed config-fetch error into a user-facing message,
 * preserving the underlying error via `cause` so it remains visible in
 * devtools and Sentry breadcrumbs alongside the friendly message.
 */
export function describeConfigError(error: any, apiEndpoint: string): Error {
  let message: string;
  if (error instanceof TypeError) {
    message = `Unable to fetch server configuration. Please check if you can connect to ${apiEndpoint} from your browser and contact support if the error continues.`;
  } else if (error instanceof SyntaxError) {
    message = `Unable to fetch server configuration. Server does not return valid JSON.`;
  } else if (error?.response?.status >= 400) {
    message = `Unable to fetch server configuration. Error message: ${error.statusText}`;
  } else {
    message = `Unable to fetch server configuration.`;
  }
  const wrapped = new Error(message);
  (wrapped as Error & { cause?: unknown }).cause = error;
  return wrapped;
}
