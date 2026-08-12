// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { ProviderTicketsListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { BooleanFilter, SelectFilter } from '@/table';

export const StatusOptions: StatusOption[] = [
  {
    label: translate('Closed'),
    value: 'Closed',
  },
  {
    label: translate('Open'),
    value: 'Open',
  },
  {
    label: translate('Resolved'),
    value: 'Resolved',
  },
  {
    label: translate('Waiting for support'),
    value: 'Waiting for support',
  },
];
export interface StatusOption {
  label: string;
  value: string;
}

export const ProviderTicketsFilter: FunctionComponent<{}> = () => (
  <>
    <SelectFilter
      title={translate('Status')}
      name="status"
      getValueLabel={(value: StatusOption) => value?.label}
      options={StatusOptions}
      getOptionValue={(option: StatusOption) => String(option.value)}
      getOptionLabel={(option: StatusOption) => option.label}
      isClearable={true}
      placeholder={translate('Status')}
    />
    <BooleanFilter
      title={translate('Escalated')}
      name="is_escalated"
      badgeValue={(value) =>
        value ? translate('Escalated') : translate('All')
      }
      ellipsis={false}
      parse={(v) => v || undefined}
    />
    <BooleanFilter
      title={translate('SLA breached')}
      name="sla_breached"
      badgeValue={(value) =>
        value ? translate('SLA breached') : translate('All')
      }
      ellipsis={false}
      parse={(v) => v || undefined}
    />
  </>
);

export const ProviderTicketsFilterFormId = 'ProviderTicketsFilter';

export interface ProviderTicketsFilterFormData {
  status: StatusOption;
  is_escalated: boolean;
  sla_breached: boolean;
}

type ProviderTicketsFilterQuery = ProviderTicketsListData['query'];

export const selectProviderTicketsFilter = (
  values?: Partial<ProviderTicketsFilterFormData>,
): ProviderTicketsFilterQuery => {
  const filter: ProviderTicketsFilterQuery = {} as any;
  if (values) {
    if (values.status) {
      filter.status = values.status.value;
    }
    if (values.is_escalated) {
      filter.is_escalated = values.is_escalated;
    }
    if (values.sla_breached) {
      filter.sla_breached = values.sla_breached;
    }
  }
  return filter;
};
