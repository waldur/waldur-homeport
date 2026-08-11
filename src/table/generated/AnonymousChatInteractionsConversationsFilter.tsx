// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  AnonymousChatInteractionsConversationsListData,
  InjectionSeverityEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  BooleanFilter,
  DateRangeFilter,
  NumberRangeFilter,
  SelectFilter,
  StringFilter,
} from '@/table';

export const InjectionSeverityOptions: InjectionSeverityOption[] = [
  {
    label: translate('Critical'),
    value: 'critical',
  },
  {
    label: translate('High'),
    value: 'high',
  },
  {
    label: translate('Low'),
    value: 'low',
  },
  {
    label: translate('Medium'),
    value: 'medium',
  },
  {
    label: translate('None'),
    value: 'none',
  },
];
export interface InjectionSeverityOption {
  label: string;
  value: InjectionSeverityEnum;
}

const formatRangeBadge = (value?: {
  min?: number | string;
  max?: number | string;
}) => {
  if (!value) return '';
  if (value.min != null && value.max != null)
    return `${value.min} – ${value.max}`;
  if (value.min != null) return `≥ ${value.min}`;
  if (value.max != null) return `≤ ${value.max}`;
  return '';
};

export const AnonymousChatInteractionsConversationsFilter: FunctionComponent<{}> =
  () => (
    <>
      <DateRangeFilter
        title={translate('Created')}
        name="created_range"
        badgeValue={formatRangeBadge}
        placeholder={translate('Created')}
      />
      <DateRangeFilter
        title={translate('Modified')}
        name="last_active_range"
        badgeValue={formatRangeBadge}
        placeholder={translate('Modified')}
      />
      <StringFilter
        title={translate('Visitor')}
        name="user_slug"
        placeholder={translate('Visitor hash contains')}
      />
      <BooleanFilter
        title={translate('Is flagged')}
        name="is_flagged"
        badgeValue={(value) =>
          value ? translate('Is flagged') : translate('All')
        }
        ellipsis={false}
        parse={(v) => v || undefined}
      />
      <SelectFilter
        title={translate('Severity')}
        name="severity"
        getValueLabel={(value: InjectionSeverityOption) => value?.label}
        options={InjectionSeverityOptions}
        getOptionValue={(option: InjectionSeverityOption) =>
          String(option.value)
        }
        getOptionLabel={(option: InjectionSeverityOption) => option.label}
        isClearable={true}
        placeholder={translate('Severity')}
      />
      <BooleanFilter
        title={translate('Has feedback')}
        name="has_feedback"
        badgeValue={(value) =>
          value ? translate('Has feedback') : translate('All')
        }
        ellipsis={false}
        parse={(v) => v || undefined}
      />
      <BooleanFilter
        title={translate('Is reviewed')}
        name="is_reviewed"
        badgeValue={(value) =>
          value ? translate('Is reviewed') : translate('All')
        }
        ellipsis={false}
        parse={(v) => v || undefined}
      />
      <NumberRangeFilter
        title={translate('Input tokens')}
        name="input_tokens_range"
        badgeValue={formatRangeBadge}
        min={0}
        placeholder={translate('Input tokens')}
      />
      <NumberRangeFilter
        title={translate('Output tokens')}
        name="output_tokens_range"
        badgeValue={formatRangeBadge}
        min={0}
        placeholder={translate('Output tokens')}
      />
      <NumberRangeFilter
        title={translate('Total tokens')}
        name="total_tokens_range"
        badgeValue={formatRangeBadge}
        min={0}
        placeholder={translate('Total tokens')}
      />
    </>
  );

export const AnonymousChatInteractionsConversationsFilterFormId =
  'AnonymousChatInteractionsConversationsFilter';

export interface AnonymousChatInteractionsConversationsFilterFormData {
  created_range: { min?: string; max?: string };
  last_active_range: { min?: string; max?: string };
  user_slug: string;
  is_flagged: boolean;
  severity: InjectionSeverityOption;
  has_feedback: boolean;
  is_reviewed: boolean;
  input_tokens_range: { min?: number; max?: number };
  output_tokens_range: { min?: number; max?: number };
  total_tokens_range: { min?: number; max?: number };
}

type AnonymousChatInteractionsConversationsFilterQuery =
  AnonymousChatInteractionsConversationsListData['query'];

export const selectAnonymousChatInteractionsConversationsFilter = (
  values?: Partial<AnonymousChatInteractionsConversationsFilterFormData>,
): AnonymousChatInteractionsConversationsFilterQuery => {
  const filter: AnonymousChatInteractionsConversationsFilterQuery = {} as any;
  if (values) {
    if (values.created_range?.min != null) {
      filter.created_after = values.created_range.min;
    }
    if (values.created_range?.max != null) {
      filter.created_before = values.created_range.max;
    }
    if (values.last_active_range?.min != null) {
      filter.last_active_after = values.last_active_range.min;
    }
    if (values.last_active_range?.max != null) {
      filter.last_active_before = values.last_active_range.max;
    }
    if (values.user_slug) {
      filter.user_slug = values.user_slug;
    }
    if (values.is_flagged) {
      filter.is_flagged = values.is_flagged;
    }
    if (values.severity) {
      filter.severity = values.severity.value;
    }
    if (values.has_feedback) {
      filter.has_feedback = values.has_feedback;
    }
    if (values.is_reviewed) {
      filter.is_reviewed = values.is_reviewed;
    }
    if (values.input_tokens_range?.min != null) {
      filter.input_tokens_min = values.input_tokens_range.min;
    }
    if (values.input_tokens_range?.max != null) {
      filter.input_tokens_max = values.input_tokens_range.max;
    }
    if (values.output_tokens_range?.min != null) {
      filter.output_tokens_min = values.output_tokens_range.min;
    }
    if (values.output_tokens_range?.max != null) {
      filter.output_tokens_max = values.output_tokens_range.max;
    }
    if (values.total_tokens_range?.min != null) {
      filter.total_tokens_min = values.total_tokens_range.min;
    }
    if (values.total_tokens_range?.max != null) {
      filter.total_tokens_max = values.total_tokens_range.max;
    }
  }
  return filter;
};
