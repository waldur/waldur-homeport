// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { OpenportalRemoteProjectAuditListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { DateTimeFilter, SelectFilter } from '@/table';

export const OpenportalRemoteProjectAuditEventTypeOptions: OpenportalRemoteProjectAuditEventTypeOption[] =
  [
    {
      label: translate('Award attempted'),
      value: 'award_attempted',
    },
    {
      label: translate('Award created'),
      value: 'award_created',
    },
    {
      label: translate('Award rejected'),
      value: 'award_rejected',
    },
    {
      label: translate('Award update confirmed'),
      value: 'award_update_confirmed',
    },
    {
      label: translate('Award update rejected'),
      value: 'award_update_rejected',
    },
    {
      label: translate('Award updated'),
      value: 'award_updated',
    },
    {
      label: translate('Resource deleted'),
      value: 'resource_deleted',
    },
    {
      label: translate('State changed'),
      value: 'state_changed',
    },
  ];
export interface OpenportalRemoteProjectAuditEventTypeOption {
  label: string;
  value: string;
}

export const OpenportalRemoteProjectAuditFilter: FunctionComponent<{}> = () => (
  <>
    <SelectFilter
      title={translate('Event type')}
      name="event_type"
      getValueLabel={(value: OpenportalRemoteProjectAuditEventTypeOption) =>
        value?.label
      }
      options={OpenportalRemoteProjectAuditEventTypeOptions}
      getOptionValue={(option: OpenportalRemoteProjectAuditEventTypeOption) =>
        String(option.value)
      }
      getOptionLabel={(option: OpenportalRemoteProjectAuditEventTypeOption) =>
        option.label
      }
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

export const OpenportalRemoteProjectAuditFilterFormId =
  'OpenportalRemoteProjectAuditFilter';

export interface OpenportalRemoteProjectAuditFilterFormData {
  event_type: OpenportalRemoteProjectAuditEventTypeOption;
  timestamp_after: any;
  timestamp_before: any;
}

type OpenportalRemoteProjectAuditFilterQuery =
  OpenportalRemoteProjectAuditListData['query'];

export const selectOpenportalRemoteProjectAuditFilter = (
  values?: Partial<OpenportalRemoteProjectAuditFilterFormData>,
): OpenportalRemoteProjectAuditFilterQuery => {
  const filter: OpenportalRemoteProjectAuditFilterQuery = {} as any;
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
