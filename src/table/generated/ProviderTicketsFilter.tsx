// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { ProviderTicketsListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { BooleanFilter, SelectFilter } from '@/table';

export const ProviderTicketsFilter: FunctionComponent<
  ProviderTicketsFilterProps
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
      title={translate('Priority')}
      name="priority"
      getValueLabel={(value: any) => value?.label}
      options={props.priorityOptions}
      isClearable={true}
      facet="priority"
      placeholder={translate('Priority')}
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

interface ProviderTicketsFilterProps {
  priorityOptions?: any[];
  statusOptions?: any[];
}

export interface ProviderTicketsFilterFormData {
  status: any;
  priority: any;
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
    if (values.priority) {
      filter.priority = values.priority.value;
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
