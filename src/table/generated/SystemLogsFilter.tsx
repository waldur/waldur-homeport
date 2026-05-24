// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import {
  SystemLogLevelEnum,
  SystemLogSourceEnum,
  SystemLogsListData,
} from 'waldur-js-client';

import { StringField } from '@/form';
import { DateField } from '@/form/DateField';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

export const SystemLogLevelOptions: SystemLogLevelOption[] = [
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
export interface SystemLogLevelOption {
  label: string;
  value: SystemLogLevelEnum;
}

export const SystemLogSourceOptions: SystemLogSourceOption[] = [
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
export interface SystemLogSourceOption {
  label: string;
  value: SystemLogSourceEnum;
}

export const SystemLogsFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem
      title={translate('Source')}
      name="source"
      getValueLabel={(value: SystemLogSourceOption) => value?.label}
    >
      <Field
        name="source"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Source')}
            options={SystemLogSourceOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: SystemLogSourceOption) =>
              String(option.value)
            }
            getOptionLabel={(option: SystemLogSourceOption) => option.label}
            isClearable={true}
            variant="tableFilter"
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Level')}
      name="level"
      getValueLabel={(value: SystemLogLevelOption) => value?.label}
    >
      <Field
        name="level"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Level')}
            options={SystemLogLevelOptions}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: SystemLogLevelOption) =>
              String(option.value)
            }
            getOptionLabel={(option: SystemLogLevelOption) => option.label}
            isClearable={true}
            variant="tableFilter"
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

export const SystemLogsFilterFormId = 'SystemLogsFilter';

export interface SystemLogsFilterFormData {
  source: SystemLogSourceOption;
  level: SystemLogLevelOption;
  instance: string;
  logger_name: string;
  start_date: string;
  end_date: string;
}

type SystemLogsFilterQuery = SystemLogsListData['query'];

export const selectSystemLogsFilter = (
  values?: Partial<SystemLogsFilterFormData>,
): SystemLogsFilterQuery => {
  const filter: SystemLogsFilterQuery = {} as any;
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
};
