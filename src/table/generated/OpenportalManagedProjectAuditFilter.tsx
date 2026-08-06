// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { OpenportalManagedProjectAuditListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { DateTimeFilter, SelectFilter } from '@/table';

export const EventTypeOptions: EventTypeOption[] = [
  {
    label: translate('Approved'),
    value: 'approved',
  },
  {
    label: translate('Created'),
    value: 'created',
  },
  {
    label: translate('Deleted'),
    value: 'deleted',
  },
  {
    label: translate('Details updated'),
    value: 'details_updated',
  },
  {
    label: translate('Note added'),
    value: 'note_added',
  },
  {
    label: translate('Project attached'),
    value: 'project_attached',
  },
  {
    label: translate('Project detached'),
    value: 'project_detached',
  },
  {
    label: translate('Rejected'),
    value: 'rejected',
  },
];
export interface EventTypeOption {
  label: string;
  value: string;
}

export const OpenportalManagedProjectAuditFilter: FunctionComponent<{}> =
  () => (
    <>
      <SelectFilter
        title={translate('Event type')}
        name="event_type"
        getValueLabel={(value: EventTypeOption) => value?.label}
        options={EventTypeOptions}
        getOptionValue={(option: EventTypeOption) => String(option.value)}
        getOptionLabel={(option: EventTypeOption) => option.label}
        isClearable={true}
        placeholder={translate('Event type')}
      />
      <DateTimeFilter
        title={translate('From')}
        name="timestamp_after"
        placeholder={translate('From')}
      />
      <DateTimeFilter
        title={translate('To')}
        name="timestamp_before"
        placeholder={translate('To')}
      />
    </>
  );

export const OpenportalManagedProjectAuditFilterFormId =
  'OpenportalManagedProjectAuditFilter';

export interface OpenportalManagedProjectAuditFilterFormData {
  event_type: EventTypeOption;
  timestamp_after: any;
  timestamp_before: any;
}

type OpenportalManagedProjectAuditFilterQuery =
  OpenportalManagedProjectAuditListData['query'];

export const selectOpenportalManagedProjectAuditFilter = (
  values?: Partial<OpenportalManagedProjectAuditFilterFormData>,
): OpenportalManagedProjectAuditFilterQuery => {
  const filter: OpenportalManagedProjectAuditFilterQuery = {} as any;
  if (values) {
    if (values.event_type) {
      filter.event_type = values.event_type.value;
    }
    if (values.timestamp_after) {
      filter.timestamp_after = values.timestamp_after;
    }
    if (values.timestamp_before) {
      filter.timestamp_before = values.timestamp_before;
    }
  }
  return filter;
};
