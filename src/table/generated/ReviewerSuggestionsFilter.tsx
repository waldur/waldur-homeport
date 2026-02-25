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

export const ReviewerSuggestionStatusEnumChoices: ReviewerSuggestionStatusEnumChoicesOption[] =
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
export interface ReviewerSuggestionStatusEnumChoicesOption {
  label: string;
  value: ReviewerSuggestionStatusEnum;
}

export const PureSuggestionsTableFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('Status')}
    name="status"
    getValueLabel={(value: ReviewerSuggestionStatusEnumChoicesOption[]) =>
      value?.map((v) => v?.label).join(', ')
    }
  >
    <Field
      name="status"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Status')}
          options={ReviewerSuggestionStatusEnumChoices}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option: ReviewerSuggestionStatusEnumChoicesOption) =>
            String(option.value)
          }
          getOptionLabel={(option: ReviewerSuggestionStatusEnumChoicesOption) =>
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

export const SuggestionsTableFilterFormId = 'SuggestionsTableFilter';

interface SuggestionsTableFilterFormData {
  status: ReviewerSuggestionStatusEnumChoicesOption[];
}

export const SuggestionsTableFilter = reduxForm<
  SuggestionsTableFilterFormData,
  {}
>({
  form: SuggestionsTableFilterFormId,
  destroyOnUnmount: false,
})(PureSuggestionsTableFilter);

export const selectSuggestionsTableFilter = createSelector<
  RootState,
  Partial<SuggestionsTableFilterFormData>,
  ReviewerSuggestionsListData['query']
>(getFormValues(SuggestionsTableFilterFormId), (values) => {
  const filter: ReviewerSuggestionsListData['query'] = {} as any;
  if (values) {
    if (values.status) {
      filter.status = values.status.map((v: any) => v.value);
    }
  }
  return filter;
});
