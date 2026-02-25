// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  SystemLogLevelEnum,
  SystemLogSourceEnum,
  SystemLogsListData,
} from 'waldur-js-client';

import { StringField } from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const SystemLogLevelEnumChoices: SystemLogLevelEnumChoicesOption[] = [
  {
    label: translate('Critical'),
    value: 'CRITICAL',
  },
  {
    label: translate('Error'),
    value: 'ERROR',
  },
  {
    label: translate('Info'),
    value: 'INFO',
  },
  {
    label: translate('Warning'),
    value: 'WARNING',
  },
];
export interface SystemLogLevelEnumChoicesOption {
  label: string;
  value: SystemLogLevelEnum;
}

export const SystemLogSourceEnumChoices: SystemLogSourceEnumChoicesOption[] = [
  {
    label: translate('API'),
    value: 'api',
  },
  {
    label: translate('Beat'),
    value: 'beat',
  },
  {
    label: translate('Worker'),
    value: 'worker',
  },
];
export interface SystemLogSourceEnumChoicesOption {
  label: string;
  value: SystemLogSourceEnum;
}

export const PureSupportSystemLogsFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem
      title={translate('Source')}
      name="source"
      getValueLabel={(value: SystemLogSourceEnumChoicesOption) => value?.label}
    >
      <Field
        name="source"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Source')}
            options={SystemLogSourceEnumChoices}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: SystemLogSourceEnumChoicesOption) =>
              String(option.value)
            }
            getOptionLabel={(option: SystemLogSourceEnumChoicesOption) =>
              option.label
            }
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Level')}
      name="level"
      getValueLabel={(value: SystemLogLevelEnumChoicesOption) => value?.label}
    >
      <Field
        name="level"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Level')}
            options={SystemLogLevelEnumChoices}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: SystemLogLevelEnumChoicesOption) =>
              String(option.value)
            }
            getOptionLabel={(option: SystemLogLevelEnumChoicesOption) =>
              option.label
            }
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Instance')} name="instance">
      <Field
        name="instance"
        component={StringField}
        placeholder={translate('Instance')}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Logger name')} name="logger_name">
      <Field
        name="logger_name"
        component={StringField}
        placeholder={translate('Logger name')}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Start date')} name="start_date">
      <Field
        name="start_date"
        component={DateField}
        placeholder={translate('Start date')}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('End date')} name="end_date">
      <Field
        name="end_date"
        component={DateField}
        placeholder={translate('End date')}
      />
    </TableFilterItem>
  </>
);

export const SupportSystemLogsFilterFormId = 'SupportSystemLogsFilter';

interface SupportSystemLogsFilterFormData {
  source: SystemLogSourceEnumChoicesOption;
  level: SystemLogLevelEnumChoicesOption;
  instance: string;
  logger_name: string;
  start_date: string;
  end_date: string;
}

export const SupportSystemLogsFilter = reduxForm<
  SupportSystemLogsFilterFormData,
  {}
>({
  form: SupportSystemLogsFilterFormId,
  destroyOnUnmount: false,
})(PureSupportSystemLogsFilter);

export const selectSupportSystemLogsFilter = createSelector(
  getFormValues(SupportSystemLogsFilterFormId),
  (values: SupportSystemLogsFilterFormData | undefined) => {
    const filter: SystemLogsListData['query'] = {};
    if (values) {
      if (values.source) {
        filter.source = values.source.value;
      }
      if (values.level) {
        filter.level = values.level.value;
      }
      if (values.instance) {
        filter.instance = values.instance;
      }
      if (values.logger_name) {
        filter.logger_name = values.logger_name;
      }
    }
    return filter;
  },
);
