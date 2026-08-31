import { translate } from '@/i18n';

/**
 * The probe and the test send share a 20/hour throttle scope, so 429 is a
 * routine answer for an operator iterating on a broken relay — and "please try
 * again" is precisely the wrong advice for the next hour.
 */
export const getRequestErrorMessage = (error: any): string => {
  if (error?.response?.status !== 429) {
    return translate('The request failed. Please try again.');
  }
  const retryAfter = Number(error.response.headers?.get?.('Retry-After'));
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return translate(
      'Rate limit reached: these checks are limited to 20 per hour. Try again in {minutes} minutes.',
      { minutes: Math.ceil(retryAfter / 60) },
    );
  }
  return translate(
    'Rate limit reached: these checks are limited to 20 per hour. Try again later.',
  );
};
