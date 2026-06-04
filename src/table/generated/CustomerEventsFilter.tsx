// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { EventsListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';

export const CustomerEventsFeatureOptions: CustomerEventsFeatureOption[] = [
  {
    label: translate('Organization events'),
    value: 'customers',
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
export interface CustomerEventsFeatureOption {
  label: string;
  value: string;
}

export const CustomerEventsFilter: FunctionComponent<{}> = () => (
  <SelectFilter
    title={translate('Type')}
    name="feature"
    getValueLabel={(value: CustomerEventsFeatureOption) => value?.label}
    placeholder={translate('Type')}
    options={CustomerEventsFeatureOptions}
    getOptionValue={(option: CustomerEventsFeatureOption) =>
      String(option.value)
    }
    getOptionLabel={(option: CustomerEventsFeatureOption) => option.label}
    isClearable={true}
    isMulti={true}
  />
);

export const CustomerEventsFilterFormId = 'CustomerEventsFilter';

export interface CustomerEventsFilterFormData {
  feature: CustomerEventsFeatureOption[];
}

export const CustomerEventsFilterInitialValues = {
  feature: [{ label: translate('Organization events'), value: 'customers' }],
};

type CustomerEventsFilterQuery = EventsListData['query'];

export const selectCustomerEventsFilter = (
  values?: Partial<CustomerEventsFilterFormData>,
): CustomerEventsFilterQuery => {
  const filter: CustomerEventsFilterQuery = {} as any;
  if (values) {
    if (values.feature) {
      filter.feature = values.feature.map((v: any) => v.value);
    }
  }
  return filter;
};
