// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { SupportFeedbacksListData, User, usersList } from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, SelectFilter } from '@/table';

export const SupportFeedbacksFilter: FunctionComponent<
  SupportFeedbacksFilterProps
> = (props) => (
  <>
    <SelectFilter
      title={translate('Evaluation')}
      name="evaluation"
      getValueLabel={(value: any) => value?.label}
      placeholder={translate('Evaluation')}
      options={props.evaluationOptions}
      isClearable={true}
    />
    <AsyncSelectFilter
      title={translate('User')}
      name="user"
      getValueLabel={(value: User) =>
        value?.full_name || value?.username || value?.email
      }
      placeholder={translate('User')}
      loadOptions={createLoadOptions(usersList, 'query')}
      defaultOptions
      getOptionValue={(option: User) => String(option.uuid || '')}
      getOptionLabel={(option: User) =>
        String(option.full_name || option.username || option.email || '')
      }
      isClearable={true}
    />
    <SelectFilter
      title={translate('Period')}
      name="period"
      getValueLabel={(value: any) => value?.label}
      placeholder={translate('Period')}
      options={props.periodOptions}
      isClearable={true}
    />
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
