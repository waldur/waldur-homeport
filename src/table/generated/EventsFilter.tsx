// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  Customer,
  EventsListData,
  Project,
  User,
  customersList,
  projectsList,
  usersList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, SelectFilter } from '@/table';

export const FeatureOptions: FeatureOption[] = [
  {
    label: translate('OpenStack resource events'),
    value: 'openstack_resources',
  },
  {
    label: translate('Project events'),
    value: 'projects',
  },
  {
    label: translate('Resource events'),
    value: 'resources',
  },
];
export interface FeatureOption {
  label: string;
  value: string;
}

export const EventsFilter: FunctionComponent<{}> = () => (
  <>
    <AsyncSelectFilter
      title={translate('Organization')}
      name="customer_uuid"
      getValueLabel={(value: Customer) => value?.name}
      loadOptions={createLoadOptions(customersList, 'query')}
      defaultOptions
      getOptionValue={(option: Customer) => String(option.uuid || '')}
      getOptionLabel={(option: Customer) => String(option.name || '')}
      isClearable={true}
      placeholder={translate('Organization')}
    />
    <AsyncSelectFilter
      title={translate('Project')}
      name="project_uuid"
      getValueLabel={(value: Project) => value?.name}
      loadOptions={createLoadOptions(projectsList, 'query')}
      defaultOptions
      getOptionValue={(option: Project) => String(option.uuid || '')}
      getOptionLabel={(option: Project) => String(option.name || '')}
      isClearable={true}
      placeholder={translate('Project')}
    />
    <AsyncSelectFilter
      title={translate('User')}
      name="user"
      getValueLabel={(value: User) =>
        value?.full_name || value?.username || value?.email
      }
      loadOptions={createLoadOptions(usersList, 'full_name', {
        o: ['full_name'],
      })}
      defaultOptions
      getOptionValue={(option: User) => String(option.uuid || '')}
      getOptionLabel={(option: User) =>
        String(option.full_name || option.username || option.email || '')
      }
      isClearable={true}
      placeholder={translate('User')}
    />
    <SelectFilter
      title={translate('Type')}
      name="feature"
      getValueLabel={(value: FeatureOption) => value?.label}
      options={FeatureOptions}
      getOptionValue={(option: FeatureOption) => String(option.value)}
      getOptionLabel={(option: FeatureOption) => option.label}
      isClearable={true}
      isMulti={true}
      placeholder={translate('Type')}
    />
  </>
);

export const EventsFilterFormId = 'EventsFilter';

export interface EventsFilterFormData {
  customer_uuid: Customer;
  project_uuid: Project;
  user: User;
  feature: FeatureOption[];
}

type EventsFilterQuery = EventsListData['query'];

export const selectEventsFilter = (
  values?: Partial<EventsFilterFormData>,
): EventsFilterQuery => {
  const filter: EventsFilterQuery = {} as any;
  if (values) {
    if (values.customer_uuid) {
      filter.customer_uuid = values.customer_uuid.uuid;
    }
    if (values.project_uuid) {
      filter.project_uuid = values.project_uuid.uuid;
    }
    if (values.user) {
      filter.user_uuid = values.user.uuid;
    }
    if (values.feature) {
      filter.feature = values.feature.map((v: any) => v.value);
    }
  }
  return filter;
};
