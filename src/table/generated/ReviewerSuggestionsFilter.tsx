// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  ReviewerSuggestionStatusEnum,
  ReviewerSuggestionsListData,
} from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

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

const PureReviewerSuggestionsFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('Status')}
    name="status"
    getValueLabel={(value: ReviewerSuggestionStatusOption) => value?.label}
  >
    <Field
      name="status"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Status')}
          options={ReviewerSuggestionStatusOptions}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option: ReviewerSuggestionStatusOption) =>
            String(option.value)
          }
          getOptionLabel={(option: ReviewerSuggestionStatusOption) =>
            option.label
          }
          isClearable={true}
          isMulti={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const ReviewerSuggestionsFilterFormId = 'ReviewerSuggestionsFilter';

export interface ReviewerSuggestionsFilterFormData {
  status: ReviewerSuggestionStatusOption[];
}

export const ReviewerSuggestionsFilter = PureReviewerSuggestionsFilter;

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
