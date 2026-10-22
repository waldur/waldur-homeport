/**
 * What holds a resource restricted on reaching a spending limit, and when the
 * restriction lifts. The Usage tab's notice and the API keys tab's pause banner
 * both say it, in the same words.
 */
import { Resource } from 'waldur-js-client';

import { formatMediumDateTime, formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { getSpendingLimitLabel } from '@/marketplace/common/spendingLimits';

export type RestrictedResource = Pick<
  Resource,
  | 'spending_limit_status'
  | 'usage_limit_restriction'
  | 'usage_limit_resumes_at'
  | 'offering_components'
>;

const getComponentName = (resource: RestrictedResource, type: string) =>
  resource.offering_components?.find((component) => component.type === type)
    ?.name || type;

/** "Held by: Tokens — Monthly limit.", or undefined when no limit is reached. */
export const getRestrictionHeldBy = (resource: RestrictedResource) => {
  const reached = (resource.spending_limit_status || []).filter(
    (status) => status.reached,
  );
  if (reached.length === 0) {
    return undefined;
  }
  const limits = reached
    .map((status) =>
      translate('{component} — {limit}', {
        component: getComponentName(resource, status.component_type),
        limit: getSpendingLimitLabel(status.period),
      }),
    )
    .join('; ');
  return translate('Held by: {limits}.', { limits });
};

/** When access resumes, or the downscaling lifts. */
export const getRestrictionResumes = (resource: RestrictedResource) => {
  // A downscaled resource keeps access, so its notice speaks of the restriction.
  const downscaled = resource.usage_limit_restriction === 'downscaled';
  const resumesAt = resource.usage_limit_resumes_at;
  // The reset task lifts the restriction within a few minutes of this time.
  if (!resumesAt) {
    return downscaled
      ? translate(
          'The restriction lifts once usage is under every limit of the resource again.',
        )
      : translate(
          'Access resumes once usage is under every limit of the resource again.',
        );
  }
  if (new Date(resumesAt).getTime() <= Date.now()) {
    return downscaled
      ? translate('The restriction lifts shortly.')
      : translate('Access resumes shortly.');
  }
  const when = {
    relative: formatRelative(resumesAt),
    date: formatMediumDateTime(resumesAt),
  };
  return downscaled
    ? translate('The restriction lifts {relative}, on {date}.', when)
    : translate('Access resumes {relative}, on {date}.', when);
};
