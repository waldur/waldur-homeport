// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  Customer,
  FeedbackRequestsListData,
  FeedbackStateEnum,
  FeedbackSurvey,
  customersList,
  feedbackSurveysList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, DateRangeFilter, SelectFilter } from '@/table';

export const FeedbackStateOptions: FeedbackStateOption[] = [
  {
    label: translate('Answered'),
    value: 'answered',
  },
  {
    label: translate('Dismissed'),
    value: 'dismissed',
  },
  {
    label: translate('Expired'),
    value: 'expired',
  },
  {
    label: translate('Pending'),
    value: 'pending',
  },
];
export interface FeedbackStateOption {
  label: string;
  value: FeedbackStateEnum;
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

export const FeedbackRequestsFilter: FunctionComponent<{}> = () => (
  <>
    <AsyncSelectFilter
      title={translate('Survey')}
      name="survey"
      getValueLabel={(value: FeedbackSurvey) => value?.name}
      loadOptions={createLoadOptions(feedbackSurveysList, 'name')}
      defaultOptions
      getOptionValue={(option: FeedbackSurvey) => String(option.uuid || '')}
      getOptionLabel={(option: FeedbackSurvey) => String(option.name || '')}
      isClearable={true}
      placeholder={translate('Survey')}
    />
    <SelectFilter
      title={translate('State')}
      name="state"
      getValueLabel={(value: FeedbackStateOption) => value?.label}
      options={FeedbackStateOptions}
      getOptionValue={(option: FeedbackStateOption) => String(option.value)}
      getOptionLabel={(option: FeedbackStateOption) => option.label}
      isClearable={true}
      isMulti={true}
      placeholder={translate('State')}
    />
    <AsyncSelectFilter
      title={translate('Organization')}
      name="customer"
      getValueLabel={(value: Customer) => value?.name}
      loadOptions={createLoadOptions(customersList, 'query')}
      defaultOptions
      getOptionValue={(option: Customer) => String(option.uuid || '')}
      getOptionLabel={(option: Customer) => String(option.name || '')}
      isClearable={true}
      placeholder={translate('Organization')}
    />
    <DateRangeFilter
      title={translate('Answered')}
      name="answered_range"
      badgeValue={formatRangeBadge}
      placeholder={translate('Answered')}
    />
  </>
);

export const FeedbackRequestsFilterFormId = 'FeedbackRequestsFilter';

export interface FeedbackRequestsFilterFormData {
  survey: FeedbackSurvey;
  state: FeedbackStateOption[];
  customer: Customer;
  answered_range: { min?: string; max?: string };
}

type FeedbackRequestsFilterQuery = FeedbackRequestsListData['query'];

export const selectFeedbackRequestsFilter = (
  values?: Partial<FeedbackRequestsFilterFormData>,
): FeedbackRequestsFilterQuery => {
  const filter: FeedbackRequestsFilterQuery = {} as any;
  if (values) {
    if (values.survey) {
      filter.survey_uuid = values.survey.uuid;
    }
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
    if (values.customer) {
      filter.customer_uuid = values.customer.uuid;
    }
    if (values.answered_range?.min != null) {
      filter.answered_after = values.answered_range.min;
    }
    if (values.answered_range?.max != null) {
      filter.answered_before = values.answered_range.max;
    }
  }
  return filter;
};
