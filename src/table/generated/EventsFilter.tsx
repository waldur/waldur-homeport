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
      name="organization"
      getValueLabel={(value: Customer) => value?.name}
      placeholder={translate('Organization')}
      loadOptions={createLoadOptions(customersList, 'query')}
      defaultOptions
      getOptionValue={(option: Customer) => String(option.uuid || '')}
      getOptionLabel={(option: Customer) => String(option.name || '')}
      isClearable={true}
    />
    <AsyncSelectFilter
      title={translate('Project')}
      name="project"
      getValueLabel={(value: Project) => value?.name}
      placeholder={translate('Project')}
      loadOptions={createLoadOptions(projectsList, 'query')}
      defaultOptions
      getOptionValue={(option: Project) => String(option.uuid || '')}
      getOptionLabel={(option: Project) => String(option.name || '')}
      isClearable={true}
    />
    <AsyncSelectFilter
      title={translate('User')}
      name="user"
      getValueLabel={(value: User) =>
        value?.full_name || value?.username || value?.email
      }
      placeholder={translate('User')}
      loadOptions={createLoadOptions(usersList, 'full_name', {
        o: ['full_name'],
      })}
      defaultOptions
      getOptionValue={(option: User) => String(option.uuid || '')}
      getOptionLabel={(option: User) =>
        String(option.full_name || option.username || option.email || '')
      }
      isClearable={true}
    />
    <SelectFilter
      title={translate('Type')}
      name="feature"
      getValueLabel={(value: FeatureOption) => value?.label}
      placeholder={translate('Type')}
      options={FeatureOptions}
      getOptionValue={(option: FeatureOption) => String(option.value)}
      getOptionLabel={(option: FeatureOption) => option.label}
      isClearable={true}
      isMulti={true}
    />
  </>
);

export const EventsFilterFormId = 'EventsFilter';

export interface EventsFilterFormData {
  organization: Customer;
  project: Project;
  user: User;
  feature: FeatureOption[];
}

type EventsFilterQuery = EventsListData['query'];

export const selectEventsFilter = (
  values?: Partial<EventsFilterFormData>,
): EventsFilterQuery => {
  const filter: EventsFilterQuery = {} as any;
  if (values) {
    if (values.organization) {
      filter.customer_uuid = values.organization.uuid;
    }
    if (values.project) {
      filter.project_uuid = values.project.uuid;
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
