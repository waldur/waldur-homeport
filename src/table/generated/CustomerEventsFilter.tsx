// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { EventsListData } from 'waldur-js-client';

import { Select, REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const FeatureChoices_1: FeatureChoices_1Option[] = [
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
export interface FeatureChoices_1Option {
  label: string;
  value: string;
}

const PureCustomerEventsFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('Type')}
    name="feature"
    getValueLabel={(value: FeatureChoices_1Option[]) =>
      value?.map((v) => v?.label).join(', ')
    }
  >
    <Field
      name="feature"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Type')}
          options={FeatureChoices_1}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option: FeatureChoices_1Option) =>
            String(option.value)
          }
          getOptionLabel={(option: FeatureChoices_1Option) => option.label}
          isClearable={true}
          isMulti={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const CustomerEventsFilterFormId = 'CustomerEventsFilter';

interface CustomerEventsFilterFormData {
  feature: FeatureChoices_1Option[];
}

export const CustomerEventsFilter = reduxForm<CustomerEventsFilterFormData, {}>(
  {
    form: CustomerEventsFilterFormId,
    destroyOnUnmount: false,
    initialValues: {
      feature: [
        { label: translate('Organization events'), value: 'customers' },
      ],
    },
  },
)(PureCustomerEventsFilter);

type CustomerEventsFilterQuery = EventsListData['query'];

export const selectCustomerEventsFilter = createSelector<
  RootState,
  Partial<CustomerEventsFilterFormData>,
  CustomerEventsFilterQuery
>(getFormValues(CustomerEventsFilterFormId), (values) => {
  const filter: CustomerEventsFilterQuery = {} as any;
  if (values) {
    if (values.feature) {
      filter.feature = values.feature.map((v: any) => v.value);
    }
  }
  return filter;
});
