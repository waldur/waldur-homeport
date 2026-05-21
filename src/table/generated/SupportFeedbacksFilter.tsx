// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { SupportFeedbacksListData, User, usersList } from 'waldur-js-client';

import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@/form/themed-select';
import { translate } from '@/i18n';
import { createSelectFetcher } from '@/table/api';
import { TableFilterItem } from '@/table/TableFilterItem';

const PureSupportFeedbacksFilter: FunctionComponent<
  SupportFeedbacksFilterProps
> = (props) => (
  <>
    <TableFilterItem
      title={translate('Evaluation')}
      name="evaluation"
      getValueLabel={(value: any) => value?.label}
    >
      <Field
        name="evaluation"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Evaluation')}
            options={props.evaluationOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
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
            loadOptions={createSelectFetcher(usersList, 'query')}
            defaultOptions
            getOptionValue={(option: User) => String(option.uuid || '')}
            getOptionLabel={(option: User) =>
              String(option.full_name || option.username || option.email || '')
            }
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Period')}
      name="period"
      getValueLabel={(value: any) => value?.label}
    >
      <Field
        name="period"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Period')}
            options={props.periodOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const SupportFeedbacksFilterFormId = 'SupportFeedbacksFilter';

interface SupportFeedbacksFilterProps {
  evaluationOptions?: any[];
  periodOptions?: any[];
}

export interface SupportFeedbacksFilterFormData {
  evaluation: any;
  user: User;
  period: any;
}

export const SupportFeedbacksFilter = PureSupportFeedbacksFilter;

type SupportFeedbacksFilterQuery = SupportFeedbacksListData['query'];

export const selectSupportFeedbacksFilter = (
  values?: Partial<SupportFeedbacksFilterFormData>,
): SupportFeedbacksFilterQuery => {
  const filter: SupportFeedbacksFilterQuery = {} as any;
  if (values) {
    if (values.evaluation) {
      filter.evaluation = values.evaluation.value;
    }
    if (values.user) {
      filter.user_uuid = values.user.uuid;
    }
    if (values.period) {
      Object.assign(filter, values.period.value);
    }
  }
  return filter;
};
