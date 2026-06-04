// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  OpenportalManagedProjectsListData,
  RemoteProjectUpdateRequestStateEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const RemoteProjectUpdateRequestStateOptions: RemoteProjectUpdateRequestStateOption[] =
  [
    {
      label: translate('Approved'),
      value: 'approved',
    },
    {
      label: translate('Canceled'),
      value: 'canceled',
    },
    {
      label: translate('Draft'),
      value: 'draft',
    },
    {
      label: translate('Pending'),
      value: 'pending',
    },
    {
      label: translate('Rejected'),
      value: 'rejected',
    },
  ];
export interface RemoteProjectUpdateRequestStateOption {
  label: string;
  value: RemoteProjectUpdateRequestStateEnum;
}

export const OpenportalManagedProjectsFilter: FunctionComponent<{}> = () => (
  <SelectFilter
    title={translate('State')}
    name="state"
    getValueLabel={(value: RemoteProjectUpdateRequestStateOption) =>
      value?.label
    }
    placeholder={translate('State')}
    options={RemoteProjectUpdateRequestStateOptions}
    getOptionValue={(option: RemoteProjectUpdateRequestStateOption) =>
      String(option.value)
    }
    getOptionLabel={(option: RemoteProjectUpdateRequestStateOption) =>
      option.label
    }
    isClearable={true}
    isMulti={true}
  />
);

export const OpenportalManagedProjectsFilterFormId =
  'OpenportalManagedProjectsFilter';

export interface OpenportalManagedProjectsFilterFormData {
  state: RemoteProjectUpdateRequestStateOption[];
}

type OpenportalManagedProjectsFilterQuery =
  OpenportalManagedProjectsListData['query'];

export const selectOpenportalManagedProjectsFilter = (
  values?: Partial<OpenportalManagedProjectsFilterFormData>,
): OpenportalManagedProjectsFilterQuery => {
  const filter: OpenportalManagedProjectsFilterQuery = {} as any;
  if (values) {
    if (values.state) {
      filter.state = values.state.map((v: any) => v.value);
    }
  }
  return filter;
};
