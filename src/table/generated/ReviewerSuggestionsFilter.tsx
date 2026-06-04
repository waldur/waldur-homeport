// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  ReviewerSuggestionStatusEnum,
  ReviewerSuggestionsListData,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const ReviewerSuggestionStatusOptions: ReviewerSuggestionStatusOption[] =
  [
    {
      label: translate('Confirmed'),
      value: 'confirmed',
    },
    {
      label: translate('Invited'),
      value: 'invited',
    },
    {
      label: translate('Pending'),
      value: 'pending',
    },
    {
      label: translate('Rejected'),
      value: 'rejected',
    },
  ];
export interface ReviewerSuggestionStatusOption {
  label: string;
  value: ReviewerSuggestionStatusEnum;
}

export const ReviewerSuggestionsFilter: FunctionComponent<{}> = () => (
  <SelectFilter
    title={translate('Status')}
    name="status"
    getValueLabel={(value: ReviewerSuggestionStatusOption) => value?.label}
    placeholder={translate('Status')}
    options={ReviewerSuggestionStatusOptions}
    getOptionValue={(option: ReviewerSuggestionStatusOption) =>
      String(option.value)
    }
    getOptionLabel={(option: ReviewerSuggestionStatusOption) => option.label}
    isClearable={true}
    isMulti={true}
  />
);

export const ReviewerSuggestionsFilterFormId = 'ReviewerSuggestionsFilter';

export interface ReviewerSuggestionsFilterFormData {
  status: ReviewerSuggestionStatusOption[];
}

type ReviewerSuggestionsFilterQuery = ReviewerSuggestionsListData['query'];

export const selectReviewerSuggestionsFilter = (
  values?: Partial<ReviewerSuggestionsFilterFormData>,
): ReviewerSuggestionsFilterQuery => {
  const filter: ReviewerSuggestionsFilterQuery = {} as any;
  if (values) {
    if (values.status) {
      filter.status = values.status.map((v: any) => v.value);
    }
  }
  return filter;
};
