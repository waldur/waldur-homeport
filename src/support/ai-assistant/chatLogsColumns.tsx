import { ShieldWarningIcon } from '@phosphor-icons/react';
import { InjectionSeverityEnum } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { formatUsageValue } from '@/core/formatNumber';
import { translate } from '@/i18n';
import { BooleanField } from '@/table/BooleanField';
import { Column } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';

import {
  asPercent,
  getSeverityBadgeVariant,
  severityLabels,
} from './chatLogsShared';

// Columns both assistant channels render the same way. Each factory takes the
// per-table bits — `id` above all, because it keys the user's saved column
// config and the two tables picked different ones before this existed.
type Overrides<T> = Partial<Column<T>> & { id: string };

interface FlaggableRow {
  is_flagged?: boolean | null;
}

export const flaggedColumn = <T extends FlaggableRow>(
  overrides: Overrides<T>,
): Column<T> => ({
  title: translate('Flagged'),
  render: ({ row }) =>
    row.is_flagged ? (
      <Badge
        variant="danger"
        size="sm"
        leftIcon={<ShieldWarningIcon weight="bold" />}
        tone="outline"
      >
        {translate('Yes')}
      </Badge>
    ) : (
      <Badge variant="success" size="sm" tone="outline">
        {translate('Clean')}
      </Badge>
    ),
  export: (row) => (row.is_flagged ? translate('Yes') : translate('No')),
  keys: ['is_flagged'],
  ...overrides,
});

interface FeedbackRow {
  has_feedback?: boolean | null;
}

export const feedbackColumn = <T extends FeedbackRow>(
  overrides: Overrides<T>,
): Column<T> => ({
  title: translate('Feedback'),
  render: ({ row }) => <BooleanField value={row.has_feedback} />,
  export: (row) => (row.has_feedback ? translate('Yes') : translate('No')),
  keys: ['has_feedback'],
  ...overrides,
});

interface SeverityRow extends FlaggableRow {
  max_severity?: string | null;
}

// Severity only means anything on a flagged row — an unflagged one has no
// detection to rank — so both the cell and the export blank it out otherwise.
export const maxSeverityColumn = <T extends SeverityRow>(
  overrides: Overrides<T>,
): Column<T> => ({
  title: translate('Max severity'),
  render: ({ row }) =>
    row.is_flagged ? (
      <Badge
        variant={getSeverityBadgeVariant(
          row.max_severity as InjectionSeverityEnum,
        )}
        size="sm"
        tone="outline"
      >
        {severityLabels[row.max_severity as InjectionSeverityEnum]}
      </Badge>
    ) : (
      renderFieldOrDash(undefined)
    ),
  export: (row) => (row.is_flagged ? row.max_severity || '' : ''),
  keys: ['max_severity'],
  optional: true,
  ...overrides,
});

type CacheTokensField = 'cache_read_tokens' | 'cache_write_tokens';

const cacheTokensColumn =
  (field: CacheTokensField, title: () => string) =>
  <T extends Partial<Record<CacheTokensField, number | null>>>(
    overrides: Overrides<T>,
  ): Column<T> => ({
    title: title(),
    render: ({ row }) => renderFieldOrDash(formatUsageValue(row[field])),
    export: (row) => row[field] ?? '',
    orderField: field,
    keys: [field],
    optional: true,
    ...overrides,
  });

// Titles are thunks so translate runs per render, not once at import.
export const cacheReadTokensColumn = cacheTokensColumn(
  'cache_read_tokens',
  () => translate('Cache reads'),
);

export const cacheWriteTokensColumn = cacheTokensColumn(
  'cache_write_tokens',
  () => translate('Cache writes'),
);

interface CacheRatioRow {
  cache_ratio?: number | null;
}

// A dash rather than N/A or 0%: null means the provider never reported cache
// hits for this thread, which says nothing about whether any happened.
export const cacheRatioColumn = <T extends CacheRatioRow>(
  overrides: Overrides<T>,
): Column<T> => ({
  title: translate('Cache ratio'),
  render: ({ row }) =>
    renderFieldOrDash(
      row.cache_ratio == null ? null : asPercent(row.cache_ratio),
    ),
  export: (row) => row.cache_ratio ?? '',
  orderField: 'cache_ratio',
  keys: ['cache_ratio'],
  optional: true,
  ...overrides,
});

// `field` is constrained to a real key so a typo cannot silently produce an
// always-empty column — the tables name their timestamps differently
// (created/modified against started/last_active).
export const timestampColumn = <T,>(
  title: string,
  field: keyof T & string,
  overrides: Overrides<T>,
): Column<T> => ({
  title,
  render: ({ row }) => formatDateTime(row[field] as string),
  export: (row) => formatDateTime(row[field] as string),
  orderField: field,
  keys: [field],
  ...overrides,
});
