// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  ChatThreadsListData,
  InjectionSeverityEnum,
  User,
  usersList,
} from 'waldur-js-client';

import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import { RangeNumberField } from '@waldur/form/RangeNumberField';
import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { createSelectFetcher } from '@waldur/table/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

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

const formatRangeBadge = (value?: { min?: number; max?: number }) => {
  if (!value) return '';
  if (value.min != null && value.max != null)
    return `${value.min} – ${value.max}`;
  if (value.min != null) return `≥ ${value.min}`;
  if (value.max != null) return `≤ ${value.max}`;
  return '';
};

const PureChatThreadsFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem title={translate('Created')} name="created">
      <Field
        name="created"
        component={DateField}
        placeholder={translate('Created')}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Modified')} name="modified">
      <Field
        name="modified"
        component={DateField}
        placeholder={translate('Modified')}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('User')}
      name="user"
      getValueLabel={(value: User) =>
        value?.full_name || value?.username || value?.email
      }
    >
      <Field
        name="user"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('User')}
            loadOptions={createSelectFetcher(usersList, 'full_name')}
            defaultOptions
            getOptionValue={(option: User) => String(option.uuid || '')}
            getOptionLabel={(option: User) =>
              String(option.full_name || option.username || option.email || '')
            }
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
            className="metronic-select-container"
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Is flagged')}
      name="is_flagged"
      badgeValue={(value) =>
        value ? translate('Is flagged') : translate('All')
      }
      ellipsis={false}
    >
      <Field
        name="is_flagged"
        component={AwesomeCheckboxField}
        label={translate('Is flagged')}
        parse={(v) => v || undefined}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Max severity')}
      name="max_severity"
      getValueLabel={(value: InjectionSeverityOption) => value?.label}
    >
      <Field
        name="max_severity"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Max severity')}
            options={InjectionSeverityOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: InjectionSeverityOption) =>
              String(option.value)
            }
            getOptionLabel={(option: InjectionSeverityOption) => option.label}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Is archived')}
      name="is_archived"
      badgeValue={(value) =>
        value ? translate('Is archived') : translate('All')
      }
      ellipsis={false}
    >
      <Field
        name="is_archived"
        component={AwesomeCheckboxField}
        label={translate('Is archived')}
        parse={(v) => v || undefined}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Has feedback')}
      name="has_feedback"
      badgeValue={(value) =>
        value ? translate('Has feedback') : translate('All')
      }
      ellipsis={false}
    >
      <Field
        name="has_feedback"
        component={AwesomeCheckboxField}
        label={translate('Has feedback')}
        parse={(v) => v || undefined}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Input tokens')}
      name="input_tokens_range"
      badgeValue={formatRangeBadge}
    >
      <Field name="input_tokens_range" component={RangeNumberField} min={0} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Output tokens')}
      name="output_tokens_range"
      badgeValue={formatRangeBadge}
    >
      <Field name="output_tokens_range" component={RangeNumberField} min={0} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Total tokens')}
      name="total_tokens_range"
      badgeValue={formatRangeBadge}
    >
      <Field name="total_tokens_range" component={RangeNumberField} min={0} />
    </TableFilterItem>
  </>
);

export const ChatThreadsFilterFormId = 'ChatThreadsFilter';

interface ChatThreadsFilterFormData {
  created: string;
  modified: string;
  user: User;
  is_flagged: boolean;
  max_severity: InjectionSeverityOption;
  is_archived: boolean;
  has_feedback: boolean;
  input_tokens_range: { min?: number; max?: number };
  output_tokens_range: { min?: number; max?: number };
  total_tokens_range: { min?: number; max?: number };
}

export const ChatThreadsFilter = reduxForm<ChatThreadsFilterFormData, {}>({
  form: ChatThreadsFilterFormId,
  destroyOnUnmount: false,
})(PureChatThreadsFilter);

type ChatThreadsFilterQuery = ChatThreadsListData['query'];

export const selectChatThreadsFilter = createSelector<
  RootState,
  Partial<ChatThreadsFilterFormData>,
  ChatThreadsFilterQuery
>(getFormValues(ChatThreadsFilterFormId), (values) => {
  const filter: ChatThreadsFilterQuery = {} as any;
  if (values) {
    if (values.created) {
      filter.created = values.created;
    }
    if (values.modified) {
      filter.modified = values.modified;
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
});
