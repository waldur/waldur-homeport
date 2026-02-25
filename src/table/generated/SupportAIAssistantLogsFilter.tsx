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
import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { createSelectFetcher } from '@waldur/table/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const InjectionSeverityEnumChoices: InjectionSeverityEnumChoicesOption[] =
  [
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
export interface InjectionSeverityEnumChoicesOption {
  label: string;
  value: InjectionSeverityEnum;
}

export const PureSupportAIAssistantLogsFilter: FunctionComponent<{}> = () => (
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
      getValueLabel={(value: User) => value?.full_name}
    >
      <Field
        name="user"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('User')}
            loadOptions={createSelectFetcher(usersList, 'full_name')}
            defaultOptions
            getOptionValue={(option: User) => String(option.uuid || '')}
            getOptionLabel={(option: User) => String(option.full_name || '')}
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
      getValueLabel={(value: InjectionSeverityEnumChoicesOption) =>
        value?.label
      }
    >
      <Field
        name="max_severity"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Max severity')}
            options={InjectionSeverityEnumChoices}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: InjectionSeverityEnumChoicesOption) =>
              String(option.value)
            }
            getOptionLabel={(option: InjectionSeverityEnumChoicesOption) =>
              option.label
            }
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
  </>
);

export const SupportAIAssistantLogsFilterFormId =
  'SupportAIAssistantLogsFilter';

interface SupportAIAssistantLogsFilterFormData {
  created: string;
  modified: string;
  user: User;
  is_flagged: boolean;
  max_severity: InjectionSeverityEnumChoicesOption;
  is_archived: boolean;
}

export const SupportAIAssistantLogsFilter = reduxForm<
  SupportAIAssistantLogsFilterFormData,
  {}
>({
  form: SupportAIAssistantLogsFilterFormId,
  destroyOnUnmount: false,
})(PureSupportAIAssistantLogsFilter);

export const selectSupportAIAssistantLogsFilter = createSelector<
  RootState,
  Partial<SupportAIAssistantLogsFilterFormData>,
  ChatThreadsListData['query']
>(getFormValues(SupportAIAssistantLogsFilterFormId), (values) => {
  const filter: ChatThreadsListData['query'] = {} as any;
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
  }
  return filter;
});
