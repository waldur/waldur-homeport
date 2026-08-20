import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

/**
 * ComponentUsage.missing_usage_policy — what the backend records for a
 * component when the next billing period passes with no usage report.
 *
 * Kept out of ./utils, which lazy-imports the usage tables that consume these
 * helpers; importing them from there would make the module graph circular.
 */
export const MISSING_USAGE_POLICY_DEFAULT = 'none';

/** Radio-group options. Built lazily so the labels pick up the active locale. */
export const getMissingUsagePolicyChoices = () => [
  {
    value: 'none',
    label: translate('Leave unreported'),
  },
  {
    value: 'reuse',
    label: translate('Reuse the reported value every month until changed'),
  },
  {
    value: 'zero',
    label: translate('Record zero'),
  },
];

/** Compact labels for table columns — the radio labels are full sentences. */
export const getMissingUsagePolicyLabel = (value?: string) =>
  renderFieldOrDash(
    {
      none: translate('Not carried over'),
      reuse: translate('Reuse value'),
      zero: translate('Record zero'),
    }[value],
  );
