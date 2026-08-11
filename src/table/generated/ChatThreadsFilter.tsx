// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  ChatThreadsListData,
  InjectionSeverityEnum,
  User,
  usersList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import {
  AsyncSelectFilter,
  BooleanFilter,
  DateRangeFilter,
  NumberRangeFilter,
  SelectFilter,
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

export const ChatThreadsFilter: FunctionComponent<{}> = () => (
  <>
    <DateRangeFilter
      title={translate('Created')}
      name="created_range"
      badgeValue={formatRangeBadge}
      placeholder={translate('Created')}
    />
    <DateRangeFilter
      title={translate('Modified')}
      name="modified_range"
      badgeValue={formatRangeBadge}
      placeholder={translate('Modified')}
    />
    <AsyncSelectFilter
      title={translate('User')}
      name="user"
      getValueLabel={(value: User) =>
        value?.full_name || value?.username || value?.email
      }
      loadOptions={createLoadOptions(usersList, 'full_name')}
      defaultOptions
      getOptionValue={(option: User) => String(option.uuid || '')}
      getOptionLabel={(option: User) =>
        String(option.full_name || option.username || option.email || '')
      }
      isClearable={true}
      placeholder={translate('User')}
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
      title={translate('Max severity')}
      name="max_severity"
      getValueLabel={(value: InjectionSeverityOption) => value?.label}
      options={InjectionSeverityOptions}
      getOptionValue={(option: InjectionSeverityOption) => String(option.value)}
      getOptionLabel={(option: InjectionSeverityOption) => option.label}
      isClearable={true}
      placeholder={translate('Max severity')}
    />
    <BooleanFilter
      title={translate('Is archived')}
      name="is_archived"
      badgeValue={(value) =>
        value ? translate('Is archived') : translate('All')
      }
      ellipsis={false}
      parse={(v) => v || undefined}
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

export const ChatThreadsFilterFormId = 'ChatThreadsFilter';

export interface ChatThreadsFilterFormData {
  created_range: { min?: string; max?: string };
  modified_range: { min?: string; max?: string };
  user: User;
  is_flagged: boolean;
  max_severity: InjectionSeverityOption;
  is_archived: boolean;
  has_feedback: boolean;
  input_tokens_range: { min?: number; max?: number };
  output_tokens_range: { min?: number; max?: number };
  total_tokens_range: { min?: number; max?: number };
}

type ChatThreadsFilterQuery = ChatThreadsListData['query'];

export const selectChatThreadsFilter = (
  values?: Partial<ChatThreadsFilterFormData>,
): ChatThreadsFilterQuery => {
  const filter: ChatThreadsFilterQuery = {} as any;
  if (values) {
    if (values.created_range?.min != null) {
      filter.created_after = values.created_range.min;
    }
    if (values.created_range?.max != null) {
      filter.created_before = values.created_range.max;
    }
    if (values.modified_range?.min != null) {
      filter.modified_after = values.modified_range.min;
    }
    if (values.modified_range?.max != null) {
      filter.modified_before = values.modified_range.max;
    }
    if (values.user) {
      filter.user = values.user.uuid;
    }
    if (values.is_flagged) {
      filter.is_flagged = values.is_flagged;
    }
    if (values.max_severity) {
      filter.max_severity = values.max_severity.value;
    }
    if (values.is_archived) {
      filter.is_archived = values.is_archived;
    }
    if (values.has_feedback) {
      filter.has_feedback = values.has_feedback;
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
