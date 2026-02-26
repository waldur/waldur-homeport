// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  ReviewerSuggestionStatusEnum,
  ReviewerSuggestionsListData,
} from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

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
    getValueLabel={(value: ReviewerSuggestionStatusOption[]) =>
      value?.map((v) => v?.label).join(', ')
    }
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

interface ReviewerSuggestionsFilterFormData {
  status: ReviewerSuggestionStatusOption[];
}

export const ReviewerSuggestionsFilter = reduxForm<
  ReviewerSuggestionsFilterFormData,
  {}
>({
  form: ReviewerSuggestionsFilterFormId,
  destroyOnUnmount: false,
})(PureReviewerSuggestionsFilter);

type ReviewerSuggestionsFilterQuery = ReviewerSuggestionsListData['query'];

export const selectReviewerSuggestionsFilter = createSelector<
  RootState,
  Partial<ReviewerSuggestionsFilterFormData>,
  ReviewerSuggestionsFilterQuery
>(getFormValues(ReviewerSuggestionsFilterFormId), (values) => {
  const filter: ReviewerSuggestionsFilterQuery = {} as any;
  if (values) {
    if (values.status) {
      filter.status = values.status.map((v: any) => v.value);
    }
  }
  return filter;
});
