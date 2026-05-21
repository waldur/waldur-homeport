// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { EventsListData } from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@/form/themed-select';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

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

const PureCustomerEventsFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('Type')}
    name="feature"
    getValueLabel={(value: CustomerEventsFeatureOption) => value?.label}
  >
    <Field
      name="feature"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Type')}
          options={CustomerEventsFeatureOptions}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option: CustomerEventsFeatureOption) =>
            String(option.value)
          }
          getOptionLabel={(option: CustomerEventsFeatureOption) => option.label}
          isClearable={true}
          isMulti={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const CustomerEventsFilterFormId = 'CustomerEventsFilter';

export interface CustomerEventsFilterFormData {
  feature: CustomerEventsFeatureOption[];
}

export const CustomerEventsFilter = PureCustomerEventsFilter;
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
