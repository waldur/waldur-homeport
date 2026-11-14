import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

/**
 * Props for the "Allowed domains" row of an award.
 *
 * allowed_domains has three states: null admits anyone, an empty list admits
 * nobody, and a list admits only the domain patterns and addresses on it. An
 * empty list formats to nothing, so it needs its own label, or it would read
 * like null.
 */
export const allowedDomainsProperty = (
  domains: string[] | null | undefined,
) => ({
  value:
    domains && domains.length === 0
      ? translate('No domains allowed')
      : propVal.list(domains),
  placeholder: translate('All domains allowed'),
});
