// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { SupportIssuesListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { BooleanFilter, SelectFilter } from '@/table';

export const IsOpenOptions: IsOpenOption[] = [
  {
    value: false,
    label: translate('Closed'),
  },
  {
    value: true,
    label: translate('Open'),
  },
];
export interface IsOpenOption {
  label: string;
  value: boolean;
}

export const SupportIssuesFilter: FunctionComponent<
  SupportIssuesFilterProps
> = (props) => (
  <>
    <SelectFilter
      title={translate('Status')}
      name="status"
      getValueLabel={(value: any) => value?.label}
      options={props.statusOptions}
      isClearable={true}
      facet="status"
      placeholder={translate('Status')}
    />
    <SelectFilter
      title={translate('Type')}
      name="type"
      getValueLabel={(value: any) => value?.label}
      options={props.typeOptions}
      isClearable={true}
      facet="type"
      placeholder={translate('Type')}
    />
    <SelectFilter
      title={translate('Open or closed')}
      name="is_open"
      getValueLabel={(value: IsOpenOption) => value?.label}
      options={IsOpenOptions}
      getOptionValue={(option: IsOpenOption) => String(option.value)}
      getOptionLabel={(option: IsOpenOption) => option.label}
      isClearable={true}
      placeholder={translate('Open or closed')}
    />
    <BooleanFilter
      title={translate('Routed to provider')}
      name="is_routed"
      badgeValue={(value) =>
        value ? translate('Routed to provider') : translate('All')
      }
      ellipsis={false}
      parse={(v) => v || undefined}
    />
  </>
);

export const SupportIssuesFilterFormId = 'SupportIssuesFilter';

interface SupportIssuesFilterProps {
  statusOptions?: any[];
  typeOptions?: any[];
}

export interface SupportIssuesFilterFormData {
  status: any;
  type: any;
  is_open: IsOpenOption;
  is_routed: boolean;
}

type SupportIssuesFilterQuery = SupportIssuesListData['query'];

export const selectSupportIssuesFilter = (
  values?: Partial<SupportIssuesFilterFormData>,
): SupportIssuesFilterQuery => {
  const filter: SupportIssuesFilterQuery = {} as any;
  if (values) {
    if (values.status) {
      filter.status = values.status.value;
    }
    if (values.type) {
      filter.type = values.type.value;
    }
    if (values.is_open) {
      filter.is_open = values.is_open.value;
    }
    if (values.is_routed) {
      filter.is_routed = values.is_routed;
    }
  }
  return filter;
};
