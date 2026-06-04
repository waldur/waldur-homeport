// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  SystemLogLevelEnum,
  SystemLogSourceEnum,
  SystemLogsListData,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter, StringFilter, DateFilter } from '@/table';

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
    <SelectFilter
      title={translate('Source')}
      name="source"
      getValueLabel={(value: SystemLogSourceOption) => value?.label}
      placeholder={translate('Source')}
      options={SystemLogSourceOptions}
      getOptionValue={(option: SystemLogSourceOption) => String(option.value)}
      getOptionLabel={(option: SystemLogSourceOption) => option.label}
      isClearable={true}
    />
    <SelectFilter
      title={translate('Level')}
      name="level"
      getValueLabel={(value: SystemLogLevelOption) => value?.label}
      placeholder={translate('Level')}
      options={SystemLogLevelOptions}
      getOptionValue={(option: SystemLogLevelOption) => String(option.value)}
      getOptionLabel={(option: SystemLogLevelOption) => option.label}
      isClearable={true}
    />
    <StringFilter
      title={translate('Instance')}
      name="instance"
      placeholder={translate('Instance')}
    />
    <StringFilter
      title={translate('Logger name')}
      name="logger_name"
      placeholder={translate('Logger name')}
    />
    <DateFilter
      title={translate('Start date')}
      name="start_date"
      placeholder={translate('Start date')}
    />
    <DateFilter
      title={translate('End date')}
      name="end_date"
      placeholder={translate('End date')}
    />
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
