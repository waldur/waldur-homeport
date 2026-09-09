import { ENV } from '@/core/config';
import { translate } from '@/i18n';

const formatErrorObject = (error) =>
  Object.keys(error)
    .map((key) =>
      isNaN(Number(key))
        ? `${key}: ${typeof error[key] === 'object' ? formatErrorObject(error[key]) : error[key]}`
        : typeof error[key] === 'object'
          ? formatErrorObject(error[key])
          : error[key],
    )
    .filter(Boolean)
    .join(', ');

// The response body as the API sent it. `waldur-auth-core`'s error interceptor
// spreads a JSON body's keys onto the error itself and adds `response`,
// `status`, `statusText` and `url` alongside them, so a DRF validation payload
// arrives as `{cidr: [...], status: 400, response, ...}` rather than under
// `data`. Everything that wants the body -- this formatter, a form routing
// errors back to its fields -- has to strip that envelope first.
const ENVELOPE_KEYS = ['response', 'status', 'statusText', 'url', 'body'];

export const getErrorBody = (error): Record<string, any> | undefined => {
  if (!error || typeof error !== 'object') return undefined;
  if (error.data && typeof error.data === 'object') return error.data;
  const body = Object.fromEntries(
    Object.entries(error).filter(([key]) => !ENVELOPE_KEYS.includes(key)),
  );
  return Object.keys(body).length ? body : undefined;
};

export const format = (error, parseResponse?) => {
  /*
  Empty response or status code -1 denotes network error.
  Usually it is caused by one of the following reasons:

  - client is not connected to the internet;
  - server is down;
  - server is inaccessible via VPN;
  - server is located in another domain and didn't return valid CORS headers;
  - request has timed out;
  - request was aborted, ie manually cancelled by the client.

  See also: https://fetch.spec.whatwg.org/#concept-filtered-response
  */

  if (Object.prototype.hasOwnProperty.call(error, 'message')) {
    return error.message;
  }

  if (!error || error.status === -1) {
    return translate(
      'Unfortunately, connection to server has failed. Please check if you can connect to {apiEndpoint} from your browser and contact support if the error continues.',
      { apiEndpoint: ENV.apiEndpoint },
    );
  }

  if (!Object.prototype.hasOwnProperty.call(error, 'status')) {
    if (typeof error === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { response, ...errorRest } = error;
      return formatErrorObject(errorRest);
    } else {
      return error;
    }
  }

  if (error.response && error.response.status === 413) {
    return translate('File too large. Please select a smaller file.');
  }

  let message = `${error.status}: ${error.statusText}.`;

  if (error.data) {
    if (parseResponse) {
      message += ' ' + parseResponse(error, message);
    }
    if (error.data.non_field_errors) {
      message += ' ' + error.data.non_field_errors;
    } else if (error.data.detail) {
      message += ' ' + error.data.detail;
    } else if (Array.isArray(error.data)) {
      message +=
        ' ' +
        error.data
          .map((item) => {
            if (typeof item === 'object') {
              return formatErrorObject(item);
            } else {
              return item;
            }
          })
          .join('. ');
    } else if (typeof error.data === 'object') {
      message += ' ' + formatErrorObject(error.data);
    }
  } else {
    // No `data`: the body was spread onto the error by the interceptor, which
    // is what a DRF validation error looks like by the time it reaches here.
    // Without this the toast read "400: ." and said nothing at all.
    const body = getErrorBody(error);
    if (body) {
      const details = formatErrorObject(body);
      if (details) {
        message += ' ' + details;
      }
    }
  }

  return message;
};
